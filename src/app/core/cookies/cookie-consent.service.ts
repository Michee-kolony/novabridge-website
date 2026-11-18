import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS, CONSENT_VERSION, COOKIE_CATEGORIES,
  CookieCategoryId, CookieDefinition,
} from './cookie.config';

export type ConsentChoices = Record<CookieCategoryId, boolean>;

export interface ConsentState {
  /** Version de la configuration acceptée. */
  version: number;
  /** Date du choix (ISO). */
  date: string;
  choices: ConsentChoices;
}

const REFUSED: ConsentChoices = { necessary: true, preferences: false, analytics: false, marketing: false };
const ACCEPTED: ConsentChoices = { necessary: true, preferences: true, analytics: true, marketing: true };

/**
 * Consentement aux cookies.
 *  - mémorise le choix dans le cookie `nb_consent` (6 mois) ;
 *  - charge les scripts d'une catégorie uniquement après acceptation ;
 *  - supprime les cookies / stockages d'une catégorie quand elle est refusée ;
 *  - expose des signaux (`allowed('analytics')`…) pour le reste de l'application.
 */
@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private document = inject(DOCUMENT);
  private loadedScripts = new Set<string>();

  readonly categories = COOKIE_CATEGORIES;
  /** Choix enregistré (null = pas encore de choix, ou choix expiré / version obsolète). */
  readonly state = signal<ConsentState | null>(this.read());
  /** Panneau de personnalisation ouvert. */
  readonly settingsOpen = signal(false);
  /** Le bandeau s'affiche tant qu'aucun choix valide n'existe. */
  readonly bannerVisible = computed(() => !this.state() && !this.settingsOpen());
  readonly choices = computed<ConsentChoices>(() => this.state()?.choices ?? REFUSED);

  constructor() {
    // Applique le consentement à chaque changement : scripts autorisés chargés, le reste nettoyé.
    effect(() => this.apply(this.choices()));
  }

  allowed(category: CookieCategoryId): boolean {
    return this.choices()[category];
  }

  acceptAll() { this.save(ACCEPTED); }
  rejectAll() { this.save(REFUSED); }

  save(choices: Partial<ConsentChoices>) {
    const previous = this.state()?.choices;
    const next: ConsentChoices = { ...REFUSED, ...choices, necessary: true };
    const state: ConsentState = { version: CONSENT_VERSION, date: new Date().toISOString(), choices: next };
    this.write(state);
    this.state.set(state);
    this.settingsOpen.set(false);
    // Un script déjà chargé ne peut pas être « déchargé » : on recharge la page si une catégorie est retirée.
    const revokedWithScripts = previous && this.categories.some(c => previous[c.id] && !next[c.id] && c.scripts.some(s => this.loadedScripts.has(s.id)));
    if (revokedWithScripts) this.document.defaultView?.location.reload();
  }

  openSettings() { this.settingsOpen.set(true); }
  closeSettings() { this.settingsOpen.set(false); }

  // ---------- Application du consentement ----------

  private apply(choices: ConsentChoices) {
    for (const cat of this.categories) {
      if (choices[cat.id]) cat.scripts.forEach(s => this.loadScript(s.id, s.src, s.inline, s.async));
      else if (!cat.required) cat.cookies.forEach(c => this.erase(c));
    }
  }

  private loadScript(id: string, src?: string, inline?: string, async = true) {
    if (this.loadedScripts.has(id)) return;
    const el = this.document.createElement('script');
    el.dataset['consent'] = id;
    if (src) { el.src = src; el.async = async; }
    if (inline) el.text = inline;
    this.document.head.appendChild(el);
    this.loadedScripts.add(id);
  }

  /** Supprime un cookie / une entrée de stockage (gère les préfixes « nom_* »). */
  private erase(def: CookieDefinition) {
    const match = (n: string) => (def.name.endsWith('*') ? n.startsWith(def.name.slice(0, -1)) : n === def.name);
    try {
      if (def.storage === 'cookie') {
        const host = this.document.location.hostname;
        const domains = ['', host, '.' + host.split('.').slice(-2).join('.')];
        this.document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(match).forEach(name =>
          domains.forEach(d => (this.document.cookie = `${name}=; Max-Age=0; path=/${d ? '; domain=' + d : ''}`)));
      } else {
        const store = def.storage === 'localStorage' ? localStorage : sessionStorage;
        Object.keys(store).filter(match).forEach(k => store.removeItem(k));
      }
    } catch { /* stockage indisponible */ }
  }

  // ---------- Lecture / écriture du cookie de consentement ----------

  private read(): ConsentState | null {
    try {
      const raw = this.document.cookie.split('; ').find(c => c.startsWith(CONSENT_COOKIE + '='));
      if (!raw) return null;
      const s = JSON.parse(decodeURIComponent(raw.slice(CONSENT_COOKIE.length + 1))) as ConsentState;
      const expired = Date.now() - new Date(s.date).getTime() > CONSENT_MAX_AGE_DAYS * 864e5;
      return s.version === CONSENT_VERSION && !expired ? { ...s, choices: { ...REFUSED, ...s.choices, necessary: true } } : null;
    } catch {
      return null;
    }
  }

  private write(s: ConsentState) {
    const secure = this.document.location.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(s))}; Max-Age=${CONSENT_MAX_AGE_DAYS * 86400}; path=/; SameSite=Lax${secure}`;
  }
}
