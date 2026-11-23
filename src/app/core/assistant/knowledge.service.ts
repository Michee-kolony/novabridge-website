import { Injectable, computed, inject } from '@angular/core';
import {
  ADVANTAGES, COMPANY, CONTACT, LOGISTICS, MARKETS, SOURCING_NETWORK, STEPS, img,
} from '../data/company';
import { LanguageService, LocalizedProduct } from '../services/language.service';
import { StoreService } from '../services/store.service';
import { INTENTS, ITEM_SYNONYMS, Intent, PRODUCT_HINTS, COUNTRY_HINTS } from './lexicon';
import {
  TextSegment, cjkRuns, distance, escapeRegExp, fuzzyEquals, hasCjk, normalize, stem, tokens, typoBudget, words,
} from './text';

export type DocType = 'page' | 'product' | 'item' | 'faq' | 'news' | 'market' | 'info';

/** Un élément de contenu du site, indexé pour la recherche et l'assistant. */
export interface KnowledgeDoc {
  id: string;
  type: DocType;
  title: string;
  body: string;
  url: string;
  queryParams?: Record<string, string>;
  image?: string;
  /** Gamme de produits concernée (slug), si applicable. */
  product?: string;
}

export interface SearchHit { doc: KnowledgeDoc; score: number; }

interface IndexedDoc { doc: KnowledgeDoc; tf: Map<string, number>; length: number; }
interface SearchIndex { docs: IndexedDoc[]; df: Map<string, number>; avgLength: number; vocab: string[]; }

// ------------------------------------------------------------------------------------------
// Reconnaissance des mots du lexique dans un message (multilingue, tolérante aux fautes).
// ------------------------------------------------------------------------------------------

const clean = (text: string) => ' ' + normalize(text).replace(/[^a-z0-9$%㐀-鿿豈-﫿]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

interface PreparedTerm { raw: string; norm: string; stem: string; phrase: boolean; }
const prepCache = new Map<string, PreparedTerm[]>();
function prepare(key: string, terms: string[]): PreparedTerm[] {
  let p = prepCache.get(key);
  if (!p) {
    p = terms.map(raw => {
      const norm = clean(raw).trim();
      return { raw, norm, stem: stem(norm), phrase: norm.includes(' ') || hasCjk(norm) || norm.length <= 3 || /[$%]/.test(norm) };
    });
    prepCache.set(key, p);
  }
  return p;
}

/** Un message prêt à être comparé aux listes de mots du lexique. */
export class Utterance {
  readonly text: string;
  readonly padded: string;
  readonly words: string[];
  private stems: Set<string>;

  constructor(text: string) {
    this.text = text;
    this.padded = clean(text);
    this.words = words(text);
    this.stems = new Set(this.words.map(stem));
  }

  /** Poids de la correspondance d'un terme (0 = absent ; une expression compte double). */
  private matchTerm(t: PreparedTerm): number {
    if (!t.norm) return 0;
    if (t.phrase) return this.padded.includes(hasCjk(t.norm) ? t.norm : ` ${t.norm} `) ? (t.norm.includes(' ') || hasCjk(t.norm) ? 2 : 1) : 0;
    if (this.stems.has(t.stem)) return 1;
    // Faute de frappe : uniquement sur des mots longs (≥ 7 lettres) commençant par la même lettre,
    // pour éviter les confusions (« merci » ≠ « merch », « mexico » ≠ « medico »).
    if (t.norm.length >= 7) {
      for (const w of this.words) {
        if (w.length >= 6 && w[0] === t.norm[0] && fuzzyEquals(w, t.norm)) return 0.8;
      }
    }
    return 0;
  }

  /** Score d'une liste de termes (somme des correspondances). */
  score(key: string, terms: string[]): number {
    let s = 0;
    for (const t of prepare(key, terms)) s += this.matchTerm(t);
    return s;
  }

  /** Intentions détectées, triées par score décroissant. */
  intents(): { intent: Intent; score: number }[] {
    return (Object.keys(INTENTS) as Intent[])
      .map(intent => ({ intent, score: this.score('i:' + intent, INTENTS[intent]) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /** Pays mentionné (valeur du formulaire de devis), le plus spécifique d'abord. */
  country(): string | null {
    const order = ['DRC Congo', 'South Africa', 'USA', 'Canada', 'Italy', 'France', 'Belgium', 'Africa (other)', 'Western Europe (other)', 'Other'];
    for (const c of order) if (this.score('c:' + c, COUNTRY_HINTS[c]) > 0) return c;
    return null;
  }

  /** Quantité demandée (« 200 pièces », « 1,000 units », « 2k », « 300件 »), sinon null. */
  quantity(): number | null {
    const raw = this.text.toLowerCase();
    // Les numéros de téléphone, pourcentages et années ne sont pas des quantités.
    // Un nombre collé à des lettres (« ffp2 », « n95 ») n'est pas une quantité.
    const candidates = [...raw.matchAll(/(?<![a-z0-9])(\d[\d\s.,]*\d|\d)\s*(k\b|[a-zà-ÿ]+|[件个双套条顶只])?/g)];
    let best: number | null = null;
    for (const m of candidates) {
      const unit = (m[2] || '').trim();
      const after = raw.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 1);
      if (after === '%' || /^%/.test(unit)) continue;
      const digits = m[1].replace(/[\s.,]/g, '');
      if (digits.length > 7) continue; // téléphone
      let n = parseInt(digits, 10);
      if (unit === 'k') n *= 1000;
      if (!n || (n >= 1900 && n <= 2100 && !unit)) continue;
      const hasUnit = /^(k|units?|pcs|pc|pieces?|items?|pairs?|pares?|paires?|unites?|unités?|unidades?|unidade|articles?|articulos?|exemplaires?|件|个|双|套|条|顶|只)$/.test(unit);
      if (hasUnit || best === null) best = n;
      if (hasUnit) break;
    }
    return best;
  }
}

// ------------------------------------------------------------------------------------------

/**
 * Base de connaissance du site : tout le contenu public (pages, gammes, articles, FAQ, actualités,
 * marchés…) dans la langue active, indexé pour une recherche plein texte de type BM25
 * avec racinisation, tolérance aux fautes, recherche par préfixe et rapprochement multilingue.
 * Mise à jour automatiquement quand la langue ou le catalogue (back-office) change.
 */
@Injectable({ providedIn: 'root' })
export class KnowledgeService {
  private lang = inject(LanguageService);
  private store = inject(StoreService);

  readonly products = computed<LocalizedProduct[]>(() => this.store.visibleProducts().map(p => this.lang.product(p)));
  readonly company = computed(() => this.lang.obj('data.company', COMPANY));
  readonly faq = computed(() => {
    const items = this.lang.t<{ q: string; a: string }[]>('faq.items', []);
    return Array.isArray(items) ? items : [];
  });

  readonly docs = computed<KnowledgeDoc[]>(() => this.buildDocs());
  private index = computed<SearchIndex>(() => this.buildIndex(this.docs()));

  // ---------- Recherche ----------

  /**
   * Recherche plein texte.
   * @param prefix tolère un dernier mot incomplet (recherche « au fil de la frappe »).
   */
  search(query: string, opts: { limit?: number; prefix?: boolean; types?: DocType[] } = {}): SearchHit[] {
    const { limit = 10, prefix = true, types } = opts;
    const index = this.index();
    const qTokens = [...new Set(tokens(query))];
    const u = new Utterance(query);
    const tags = this.tagsFor(u);
    if (!qTokens.length && !tags.length) return [];

    // Expansion de chaque mot : exact, faute de frappe, préfixe (pondérés).
    const weighted = new Map<string, number>();
    const add = (t: string, w: number) => weighted.set(t, Math.max(weighted.get(t) ?? 0, w));
    qTokens.forEach((q, i) => {
      const isLast = i === qTokens.length - 1;
      if (index.df.has(q)) add(q, 1);
      const budget = typoBudget(q);
      let prefixes = 0;
      for (const v of index.vocab) {
        if (v === q || v.startsWith('#')) continue;
        if (prefix && isLast && q.length >= 2 && v.startsWith(q) && prefixes < 12) { add(v, 0.8); prefixes++; continue; }
        if (q.length >= 4 && (v.startsWith(q) || (v.length >= 4 && q.startsWith(v)))) { add(v, 0.6); continue; }
        if (budget && Math.abs(v.length - q.length) <= budget && v[0] === q[0] && distance(q, v, budget) <= budget) add(v, 0.7);
      }
    });
    for (const t of tags) add(t, 0.9);

    const N = index.docs.length;
    const k1 = 1.2, b = 0.75;
    const hits: SearchHit[] = [];
    for (const d of index.docs) {
      if (types && !types.includes(d.doc.type)) continue;
      let score = 0;
      let matchedWords = 0;
      for (const [term, w] of weighted) {
        const f = d.tf.get(term);
        if (!f) continue;
        const df = index.df.get(term) ?? 1;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += w * idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.length / index.avgLength));
        if (!term.startsWith('#')) matchedWords++;
      }
      if (score <= 0) continue;
      // Bonus : tous les mots de la requête se retrouvent dans le titre.
      const title = normalize(d.doc.title);
      if (qTokens.length && qTokens.every(q => title.includes(q.slice(0, Math.max(2, q.length - 1))))) score *= 1.35;
      if (matchedWords === 0 && !tags.length) continue;
      hits.push({ doc: d.doc, score });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /** Gammes de produits évoquées par un message (par pertinence décroissante). */
  productsIn(u: Utterance): { product: LocalizedProduct; score: number }[] {
    return this.products()
      .map(p => {
        let score = u.score('p:' + p.slug, PRODUCT_HINTS[p.slug] ?? []);
        // Nom de la gamme dans la langue active.
        if (u.padded.includes(clean(p.name))) score += 3;
        return { product: p, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /** Article précis du catalogue correspondant au message (ex. « gants nitrile »), s'il y en a un. */
  itemIn(query: string): SearchHit | null {
    const hit = this.search(query, { limit: 1, prefix: false, types: ['item'] })[0];
    return hit && hit.score >= 4 ? hit : null;
  }

  // ---------- Mise en évidence (résultats de recherche) ----------

  /** Découpe un texte en segments, en marquant les mots correspondant à la requête. */
  highlight(text: string, query: string): TextSegment[] {
    const q = words(query).filter(w => w.length >= 2 || hasCjk(w));
    const qStems = q.map(stem);
    const runs = cjkRuns(query);
    const parts = runs.length ? text.split(new RegExp(`(${runs.map(escapeRegExp).join('|')})`, 'g')) : [text];
    const out: TextSegment[] = [];
    for (const part of parts) {
      if (!part) continue;
      if (runs.includes(part)) { out.push({ text: part, mark: true }); continue; }
      for (const piece of part.split(/([\p{L}\p{N}]+)/u)) {
        if (!piece) continue;
        const n = normalize(piece);
        const s = stem(n);
        const hit = /[\p{L}\p{N}]/u.test(piece) && n.length >= 2 && q.some((w, i) =>
          s === qStems[i] || (w.length >= 2 && n.startsWith(w)) || (w.length >= 5 && fuzzyEquals(n, w)));
        const last = out[out.length - 1];
        if (last && !!last.mark === hit) last.text += piece; else out.push({ text: piece, mark: hit });
      }
    }
    return out;
  }

  /** Extrait d'un texte centré sur le premier mot trouvé. */
  snippet(text: string, query: string, max = 160): TextSegment[] {
    if (text.length <= max) return this.highlight(text, query);
    const segs = this.highlight(text, query);
    let pos = 0;
    for (const s of segs) { if (s.mark) break; pos += s.text.length; }
    if (pos >= text.length) pos = 0;
    let start = Math.max(0, pos - 50);
    if (start > 0) { const sp = text.indexOf(' ', start); if (sp > 0 && sp < pos) start = sp + 1; }
    let end = Math.min(text.length, start + max);
    if (end < text.length) { const sp = text.lastIndexOf(' ', end); if (sp > start + 40) end = sp; }
    const cut = (start > 0 ? '… ' : '') + text.slice(start, end).trim() + (end < text.length ? ' …' : '');
    return this.highlight(cut, query);
  }

  // ---------- Construction ----------

  /** Étiquettes « conceptuelles » (intentions, gammes) : elles relient une question à un contenu même dans une autre langue. */
  private tagsFor(u: Utterance): string[] {
    const tags: string[] = [];
    for (const { intent, score } of u.intents()) if (score >= 1 && !['greeting', 'thanks', 'bye', 'yes', 'no', 'howareyou'].includes(intent)) tags.push('#i:' + intent);
    for (const slug of Object.keys(PRODUCT_HINTS)) if (u.score('p:' + slug, PRODUCT_HINTS[slug]) > 0) tags.push('#p:' + slug);
    for (const w of Object.keys(ITEM_SYNONYMS)) if (u.score('w:' + w, ITEM_SYNONYMS[w]) > 0) tags.push('#w:' + w);
    return tags;
  }

  private buildIndex(docs: KnowledgeDoc[]): SearchIndex {
    const df = new Map<string, number>();
    let total = 0;
    const indexed = docs.map(doc => {
      const tf = new Map<string, number>();
      const bump = (t: string, n = 1) => tf.set(t, (tf.get(t) ?? 0) + n);
      for (const t of tokens(doc.title)) bump(t, 3);
      for (const t of tokens(doc.body)) bump(t, 1);
      const u = new Utterance(doc.title + ' \n ' + (doc.type === 'faq' ? doc.title : doc.body));
      for (const tag of this.tagsFor(u)) bump(tag, 2);
      if (doc.product) bump('#p:' + doc.product, 2);
      const length = [...tf.values()].reduce((a, b) => a + b, 0);
      total += length;
      for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
      return { doc, tf, length };
    });
    return { docs: indexed, df, avgLength: total / Math.max(1, indexed.length), vocab: [...df.keys()] };
  }

  private buildDocs(): KnowledgeDoc[] {
    const t = <T = string>(k: string, f?: T) => this.lang.t<T>(k, f);
    const docs: KnowledgeDoc[] = [];
    const company = this.company();

    // Pages du site : tout le texte de la page est indexé.
    const pages: { key: string; url: string; label: string; section: string[] }[] = [
      { key: 'home', url: '/', label: 'nav.home', section: ['home'] },
      { key: 'products', url: '/products', label: 'nav.products', section: ['products'] },
      { key: 'markets', url: '/markets', label: 'nav.markets', section: ['markets'] },
      { key: 'how', url: '/how-it-works', label: 'nav.howItWorks', section: ['how'] },
      { key: 'about', url: '/about', label: 'nav.about', section: ['about'] },
      { key: 'news', url: '/news', label: 'nav.news', section: ['news.hero'] },
      { key: 'contact', url: '/contact', label: 'nav.contact', section: ['contact.hero', 'contact.form'] },
      { key: 'quote', url: '/quote', label: 'common.requestQuote', section: ['quote.hero'] },
      { key: 'faq', url: '/faq', label: 'faq.kicker', section: ['faq.title', 'faq.subtitle'] },
      { key: 'cookies', url: '/cookies', label: 'footer.cookiePolicy', section: ['cookies.policy'] },
    ];
    for (const p of pages) {
      docs.push({ id: 'page:' + p.key, type: 'page', title: t(p.label), body: p.section.map(s => flatten(t(s, ''))).join(' · '), url: p.url });
    }

    // Gammes de produits et chacun de leurs articles.
    for (const p of this.products()) {
      docs.push({
        id: 'product:' + p.slug, type: 'product', title: p.name, product: p.slug, url: `/products/${p.slug}`, image: img(p.image, 200, 200),
        body: [p.short, p.description, p.items.join(', '), p.industries.join(', '), p.hub].join(' · '),
      });
      p.items.forEach((item, i) => docs.push({
        id: `item:${p.slug}:${i}`, type: 'item', title: item, product: p.slug, url: `/products/${p.slug}`,
        body: `${p.name} · ${p.industries.join(', ')} · ${p.hub}`,
      }));
    }

    // FAQ.
    this.faq().forEach((f, i) => docs.push({ id: 'faq:' + i, type: 'faq', title: f.q, body: f.a, url: '/faq' }));

    // Actualités publiées.
    for (const a of this.store.publishedAnnouncements().map(x => this.lang.announcement(x))) {
      docs.push({ id: 'news:' + a.id, type: 'news', title: a.title, body: `${a.excerpt} ${a.content}`, url: `/news/${a.id}`, image: img(a.image, 200, 200) });
    }

    // Marchés, réseau d'usines, logistique, avantages, étapes.
    for (const m of this.lang.list('data.markets', MARKETS)) {
      docs.push({ id: 'market:' + m.id, type: 'market', title: `${m.flag} ${m.name}`, body: [m.badge, m.cities.join(', '), m.sectors.join(', ')].filter(Boolean).join(' · '), url: '/markets' });
    }
    this.lang.list('data.network', SOURCING_NETWORK).forEach((n, i) =>
      docs.push({ id: 'network:' + i, type: 'info', title: n.place, body: n.detail, url: '/about' }));
    this.lang.list('data.logistics', LOGISTICS).forEach((l, i) =>
      docs.push({ id: 'logistics:' + i, type: 'info', title: l.title, body: l.text, url: '/markets' }));
    this.lang.list('data.advantages', ADVANTAGES).forEach((a, i) =>
      docs.push({ id: 'advantage:' + i, type: 'info', title: a.title, body: a.text, url: '/how-it-works' }));
    const steps = this.lang.list('data.steps', STEPS);
    docs.push({ id: 'steps', type: 'info', title: t('nav.howItWorks'), body: steps.map(s => `${s.n}. ${s.title} — ${s.text}`).join(' · '), url: '/how-it-works' });

    // Coordonnées et présentation.
    docs.push({
      id: 'contact', type: 'info', title: t('nav.contact'), url: '/contact',
      body: [company.email, ...CONTACT.emails, ...CONTACT.phones, company.location, company.languages.join(', '), CONTACT.whatsapp ? 'WhatsApp' : ''].filter(Boolean).join(' · '),
    });
    docs.push({ id: 'company', type: 'info', title: company.name, body: `${company.tagline}. ${company.intro} ${company.promise.join(' ')} ${company.slogan}`, url: '/about' });

    return docs.filter(d => d.title);
  }
}

/** Concatène toutes les chaînes d'un objet de traduction (texte d'une page). */
function flatten(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(flatten).join(' · ');
  if (v && typeof v === 'object') return Object.values(v).map(flatten).join(' · ');
  return '';
}
