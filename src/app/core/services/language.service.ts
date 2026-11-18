import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeZh from '@angular/common/locales/zh';
import localeEs from '@angular/common/locales/es';
import { TranslateService } from '@ngx-translate/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { Announcement, ProductLine } from '../models';
import { PRODUCT_LINES, SEED_ANNOUNCEMENTS } from '../data/seed';
import { CookieConsentService } from '../cookies/cookie-consent.service';

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeZh, 'zh');
registerLocaleData(localeEs, 'es');

export type Lang = 'en' | 'fr' | 'es' | 'zh';

export interface LanguageOption {
  code: Lang;
  /** Nom de la langue dans la langue elle-même. */
  label: string;
  /** Libellé court affiché dans l'en-tête. */
  short: string;
  /** Valeur de l'attribut <html lang>. */
  html: string;
  /** Locale Angular utilisée pour les dates. */
  locale: string;
  /** Drapeau du pays (public/flags). */
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English (US)', short: 'EN', html: 'en-US', locale: 'en-US', flag: 'flags/us.svg' },
  { code: 'fr', label: 'Français', short: 'FR', html: 'fr', locale: 'fr', flag: 'flags/fr.svg' },
  { code: 'es', label: 'Español', short: 'ES', html: 'es', locale: 'es', flag: 'flags/es.svg' },
  { code: 'zh', label: '简体中文', short: '中文', html: 'zh-CN', locale: 'zh', flag: 'flags/cn.svg' },
];

/** Langue par défaut du site : anglais américain. */
export const DEFAULT_LANG: Lang = 'en';
const STORAGE_KEY = 'novabridge-lang';

export type LocalizedProduct = ProductLine & { rawName: string };

/**
 * Gère la langue du site client (anglais par défaut, français, espagnol, chinois).
 * Les textes sont dans public/i18n/<langue>.json.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);
  private consent = inject(CookieConsentService);

  readonly languages = LANGUAGES;
  readonly current = signal<Lang>(DEFAULT_LANG);
  readonly option = computed(() => LANGUAGES.find(l => l.code === this.current())!);
  /** Locale à passer au DatePipe : {{ d | date: 'mediumDate' : undefined : lang.locale() }} */
  readonly locale = computed(() => this.option().locale);

  constructor() {
    // La langue n'est mémorisée que si l'utilisateur accepte les cookies « Préférences ».
    effect(() => {
      const lang = this.current();
      if (!this.consent.allowed('preferences')) return;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* stockage indisponible */ }
    });
  }

  /** Appelé au démarrage de l'application (APP_INITIALIZER). */
  init(): Promise<unknown> {
    this.translate.addLangs(LANGUAGES.map(l => l.code));
    this.translate.setDefaultLang(DEFAULT_LANG);
    return firstValueFrom(this.use(this.saved()));
  }

  use(lang: Lang): Observable<unknown> {
    return this.translate.use(lang).pipe(tap(() => {
      this.current.set(lang);
      this.document.documentElement.lang = LANGUAGES.find(l => l.code === lang)!.html;
    }));
  }

  set(lang: Lang) { this.use(lang).subscribe(); }

  /** Traduction instantanée ; renvoie `fallback` si la clé n'existe pas. */
  t<T = string>(key: string, fallback?: T): T {
    this.current(); // rend les computed() appelants réactifs au changement de langue
    const v = this.translate.instant(key);
    return (v === key && fallback !== undefined ? fallback : v) as T;
  }

  /** Fusionne un objet de données avec sa traduction (clé → objet partiel). */
  obj<T extends object>(key: string, data: T): T {
    const tr = this.t<Partial<T> | string>(key, {});
    return { ...data, ...(typeof tr === 'object' ? tr : {}) };
  }

  /** Fusionne une liste de données avec sa traduction (clé → tableau d'objets partiels, même ordre). */
  list<T extends object>(key: string, data: T[]): T[] {
    const tr = this.t<Partial<T>[] | string>(key, []);
    return data.map((d, i) => ({ ...d, ...(Array.isArray(tr) ? tr[i] : {}) }));
  }

  private saved(): Lang {
    if (!this.consent.allowed('preferences')) return DEFAULT_LANG;
    try {
      const v = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (v && LANGUAGES.some(l => l.code === v)) return v;
    } catch { /* ignore */ }
    return DEFAULT_LANG;
  }

  // ---------- Contenus modifiables dans le back-office ----------
  // Un champ est traduit uniquement s'il n'a pas été modifié par l'administrateur
  // (sinon on affiche le texte saisi dans le back-office tel quel).

  product(p: ProductLine): LocalizedProduct {
    const seed = PRODUCT_LINES.find(s => s.slug === p.slug);
    const pick = <K extends keyof ProductLine>(field: K): ProductLine[K] =>
      seed && same(seed[field], p[field]) ? this.t(`content.products.${p.slug}.${field}`, p[field]) : p[field];
    return {
      ...p,
      rawName: p.name,
      name: pick('name'),
      short: pick('short'),
      description: pick('description'),
      items: pick('items'),
      industries: pick('industries'),
      hub: pick('hub'),
    };
  }

  announcement(a: Announcement): Announcement {
    const seed = SEED_ANNOUNCEMENTS.find(s => s.id === a.id);
    const pick = <K extends 'title' | 'excerpt' | 'content'>(field: K): string =>
      seed && seed[field] === a[field] ? this.t(`content.news.${a.id}.${field}`, a[field]) : a[field];
    return { ...a, title: pick('title'), excerpt: pick('excerpt'), content: pick('content') };
  }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
