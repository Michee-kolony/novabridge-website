import { Injectable, computed, effect, signal } from '@angular/core';
import { Announcement, ContactMessage, ProductLine, QuoteRequest, QuoteStatus } from '../models';
import { PRODUCT_LINES, SEED_ANNOUNCEMENTS, SEED_MESSAGES, SEED_QUOTES } from '../data/seed';

const KEY = 'novabridge-store-v1';
/** Incrémenter quand le catalogue d'origine change : les gammes stockées sont alors remplacées (devis, messages et annonces sont conservés). */
const CATALOG_VERSION = 2;

interface StoreState {
  catalogVersion?: number;
  quotes: QuoteRequest[];
  messages: ContactMessage[];
  announcements: Announcement[];
  products: ProductLine[];
}

const seed = (): StoreState => structuredClone({
  catalogVersion: CATALOG_VERSION,
  quotes: SEED_QUOTES,
  messages: SEED_MESSAGES,
  announcements: SEED_ANNOUNCEMENTS,
  products: PRODUCT_LINES,
});

/**
 * Données statiques de l'application (pas de serveur pour l'instant).
 * L'état est conservé dans le localStorage du navigateur : ce que l'administrateur
 * publie dans le back-office apparaît immédiatement sur le site client.
 * Pour brancher une vraie API plus tard, seules les méthodes de ce service changent.
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private state = signal<StoreState>(this.load());

  readonly quotes = computed(() => [...this.state().quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  readonly messages = computed(() => [...this.state().messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  readonly announcements = computed(() => [...this.state().announcements].sort((a, b) => b.date.localeCompare(a.date)));
  readonly publishedAnnouncements = computed(() => this.announcements().filter(a => a.published));
  readonly products = computed(() => this.state().products);
  readonly visibleProducts = computed(() => this.state().products.filter(p => p.visible));
  readonly newQuotesCount = computed(() => this.state().quotes.filter(q => q.status === 'nouveau').length);
  readonly unreadMessagesCount = computed(() => this.state().messages.filter(m => !m.read).length);

  constructor() {
    effect(() => {
      try { localStorage.setItem(KEY, JSON.stringify(this.state())); } catch { /* stockage indisponible */ }
    });
  }

  private load(): StoreState {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoreState;
        const state = { ...seed(), ...stored };
        if (stored.catalogVersion !== CATALOG_VERSION) {
          state.products = seed().products;
          state.catalogVersion = CATALOG_VERSION;
        }
        return state;
      }
    } catch { /* ignore */ }
    return seed();
  }

  private patch(fn: (s: StoreState) => Partial<StoreState>) {
    this.state.update(s => ({ ...s, ...fn(s) }));
  }

  private uid(prefix: string, list: { id: string }[]) {
    const max = list.reduce((m, x) => Math.max(m, parseInt(x.id.replace(/\D/g, ''), 10) || 0), 1000);
    return `${prefix}-${max + 1}`;
  }

  // ---------- Devis ----------
  quote(id: string) { return this.state().quotes.find(q => q.id === id); }

  /** Numéro que recevra le prochain devis. */
  nextQuoteId() { return this.uid('Q', this.state().quotes); }

  addQuote(q: Omit<QuoteRequest, 'id' | 'createdAt' | 'status' | 'notes'>): QuoteRequest {
    const created: QuoteRequest = { ...q, id: this.uid('Q', this.state().quotes), createdAt: new Date().toISOString(), status: 'nouveau', notes: [] };
    this.patch(s => ({ quotes: [created, ...s.quotes] }));
    return created;
  }
  setQuoteStatus(id: string, status: QuoteStatus) {
    this.patch(s => ({ quotes: s.quotes.map(q => (q.id === id ? { ...q, status } : q)) }));
  }
  addQuoteNote(id: string, note: string) {
    this.patch(s => ({ quotes: s.quotes.map(q => (q.id === id ? { ...q, notes: [...q.notes, note] } : q)) }));
  }
  deleteQuote(id: string) { this.patch(s => ({ quotes: s.quotes.filter(q => q.id !== id) })); }

  // ---------- Messages ----------
  addMessage(m: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) {
    const created: ContactMessage = { ...m, id: this.uid('M', this.state().messages), createdAt: new Date().toISOString(), read: false };
    this.patch(s => ({ messages: [created, ...s.messages] }));
  }
  markMessage(id: string, read = true) {
    this.patch(s => ({ messages: s.messages.map(m => (m.id === id ? { ...m, read } : m)) }));
  }
  deleteMessage(id: string) { this.patch(s => ({ messages: s.messages.filter(m => m.id !== id) })); }

  // ---------- Annonces ----------
  announcement(id: string) { return this.state().announcements.find(a => a.id === id); }
  saveAnnouncement(a: Omit<Announcement, 'id'> & { id?: string }) {
    if (a.id) {
      this.patch(s => ({ announcements: s.announcements.map(x => (x.id === a.id ? { ...(a as Announcement) } : x)) }));
      return a.id;
    }
    const id = 'a' + Date.now().toString(36);
    this.patch(s => ({ announcements: [{ ...a, id }, ...s.announcements] }));
    return id;
  }
  togglePublished(id: string) {
    this.patch(s => ({ announcements: s.announcements.map(a => (a.id === id ? { ...a, published: !a.published } : a)) }));
  }
  deleteAnnouncement(id: string) { this.patch(s => ({ announcements: s.announcements.filter(a => a.id !== id) })); }

  // ---------- Produits ----------
  product(slug: string) { return this.state().products.find(p => p.slug === slug); }
  updateProduct(slug: string, changes: Partial<ProductLine>) {
    this.patch(s => ({ products: s.products.map(p => (p.slug === slug ? { ...p, ...changes } : p)) }));
  }

  // ---------- Divers ----------
  resetDemo() { this.state.set(seed()); }
}
