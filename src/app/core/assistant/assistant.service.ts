import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { CONTACT, LOGISTICS, MARKETS, SOURCING_NETWORK, STEPS, img, telHref } from '../data/company';
import { LANGUAGES, Lang, LanguageService, LocalizedProduct } from '../services/language.service';
import { MailService } from '../services/mail.service';
import { StoreService } from '../services/store.service';
import { KnowledgeService, SearchHit, Utterance } from './knowledge.service';
import { FOLLOW_UP, INTENT_PRIORITY, Intent, SMALL_TALK } from './lexicon';
import { TextSegment, detectLang, rich } from './text';

export interface ChatLink { label: string; url?: string; queryParams?: Record<string, string>; href?: string; external?: boolean; icon?: string; }
export type ChipAction = Intent | 'handoff' | 'cancel' | 'restart' | 'lang';
export interface ChatChip { label: string; action: ChipAction; product?: string; lang?: Lang; }
export interface ChatCard { title: string; text: string; image?: string; url: string; queryParams?: Record<string, string>; }
export interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
  lines: TextSegment[][];
  links?: ChatLink[];
  chips?: ChatChip[];
  cards?: ChatCard[];
  time: Date;
}

interface Reply { text: string; links?: ChatLink[]; chips?: ChatChip[]; cards?: ChatCard[]; }

type HandoffStep = 'name' | 'email' | 'message';
interface Context {
  product?: string;
  country?: string;
  quantity?: number;
  lastIntent?: Intent;
  fallbacks: number;
  langOffered: boolean;
  handoff?: { step: HandoffStep; name?: string; email?: string };
}

/** Pays du formulaire de devis (même ordre que COUNTRIES dans quote.component.ts, traduits via « quote.countries »). */
const QUOTE_COUNTRIES = ['USA', 'Canada', 'Italy', 'France', 'Belgium', 'Western Europe (other)', 'DRC Congo', 'South Africa', 'Africa (other)', 'Other'];
const AFRICA = ['DRC Congo', 'South Africa', 'Africa (other)'];
/** Intentions dont la réponse dépend de la gamme de produits évoquée. */
const PRODUCT_AWARE: Intent[] = ['price', 'quote', 'order', 'branding', 'moq', 'products'];
const CANCEL = /\b(cancel|stop|annuler|annule|laisse tomber|cancelar|parar|deixa)\b|取消/;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

/**
 * Assistant virtuel NovaBridge — fonctionne entièrement dans le navigateur.
 *
 * Comment il « comprend » :
 *  1. détection des intentions (prix, délais, MOQ, livraison…) dans 5 langues, fautes de frappe tolérées ;
 *  2. extraction des entités : gamme de produits, article précis, quantité, pays ;
 *  3. mémoire de la conversation (« et pour 200 pièces ? » reprend le produit évoqué avant,
 *     ou celui de la page produit consultée) ;
 *  4. plusieurs questions dans un même message → réponse combinée ;
 *  5. sinon, recherche plein texte dans tout le contenu du site (FAQ, produits, actualités…) ;
 *  6. en dernier recours, transfert vers l'équipe (message enregistré dans le back-office + e-mail).
 */
@Injectable({ providedIn: 'root' })
export class AssistantService {
  private kb = inject(KnowledgeService);
  private lang = inject(LanguageService);
  private translate = inject(TranslateService);
  private store = inject(StoreService);
  private mail = inject(MailService);
  private router = inject(Router);

  readonly messages = signal<ChatMessage[]>([]);
  readonly open = signal(false);
  readonly typing = signal(false);
  readonly unread = signal(0);
  private ctx: Context = { fallbacks: 0, langOffered: false };
  /** Quantité citée dans le message en cours (et non dans un message précédent). */
  private turnQty: number | null = null;
  private seq = 0;
  private queue = Promise.resolve();

  private url = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)), { initialValue: this.router.url });
  /** Gamme de la page produit actuellement consultée (contexte implicite). */
  private pageProduct = computed(() => this.url().match(/^\/products\/([^/?#]+)/)?.[1]);

  // ---------- API publique ----------

  toggle() { this.open() ? this.close() : this.show(); }

  show(question?: string) {
    this.open.set(true);
    this.unread.set(0);
    if (!this.messages().length) this.welcome();
    if (question?.trim()) this.send(question);
  }

  close() { this.open.set(false); }

  restart() {
    this.messages.set([]);
    this.ctx = { fallbacks: 0, langOffered: false };
    this.welcome();
  }

  /** Message tapé par l'utilisateur. */
  send(text: string) {
    const clean = text.trim().slice(0, 600);
    if (!clean) return;
    this.push('user', { text: clean });
    this.respond(() => this.think(clean));
  }

  /** Clic sur une suggestion. */
  choose(chip: ChatChip) {
    if (chip.action === 'lang' && chip.lang) {
      this.lang.use(chip.lang).subscribe(() => this.respond(() => this.reply('a.switched')));
      return;
    }
    if (chip.action === 'restart') { this.restart(); return; }
    this.push('user', { text: chip.label });
    if (chip.product) this.ctx.product = chip.product;
    const action = chip.action;
    this.respond(() => {
      this.turnQty = null;
      if (action === 'handoff') return this.startHandoff();
      if (action === 'cancel' || action === 'lang') { this.ctx.handoff = undefined; return this.reply('h.cancelled', {}, { chips: this.starterChips() }); }
      this.ctx.handoff = undefined;
      // Une suggestion sans produit ne reprend le produit du contexte que si elle en dépend (prix, MOQ…).
      return this.answerIntents([action], new Utterance(chip.label), !!chip.product, action === 'products' && !chip.product ? null : undefined);
    });
  }

  // ---------- Fil de la conversation ----------

  private welcome() {
    const p = this.pageProduct() && this.kb.products().find(x => x.slug === this.pageProduct());
    this.push('bot', {
      text: this.tr('assistant.welcome', { company: this.kb.company().shortName }) + (p ? '\n\n' + this.tr('assistant.a.onProductPage', { product: p.name }) : ''),
      chips: p ? this.productChips(p) : this.starterChips(),
    });
  }

  private respond(build: () => Reply | Promise<Reply>) {
    this.queue = this.queue.then(async () => {
      this.typing.set(true);
      try {
        const reply = await build();
        const delay = Math.min(1400, 350 + reply.text.length * 6);
        await new Promise(r => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : delay));
        this.push('bot', reply);
        if (!this.open()) this.unread.update(n => n + 1);
      } finally {
        this.typing.set(false);
      }
    });
  }

  private push(from: 'bot' | 'user', r: Reply) {
    this.messages.update(list => [...list, { id: ++this.seq, from, time: new Date(), lines: rich(r.text), ...r }]);
  }

  // ---------- Raisonnement ----------

  private async think(text: string): Promise<Reply> {
    if (this.ctx.handoff) return this.continueHandoff(text);

    const u = new Utterance(text);
    const found = this.kb.productsIn(u);
    const quantity = u.quantity();
    this.turnQty = quantity;
    const country = u.country();
    if (found.length) this.ctx.product = found[0].product.slug;
    if (quantity) this.ctx.quantity = quantity;
    if (country) this.ctx.country = country;

    const detected = u.intents();
    const strong = detected.filter(d => d.score >= 0.8).map(d => d.intent);
    let business = strong.filter(i => !SMALL_TALK.includes(i));
    const smallTalk = strong.filter(i => SMALL_TALK.includes(i));

    let reply: Reply | null = null;

    if (business.length) {
      reply = this.answerIntents(business, u, !!found.length);
    } else if (found.length) {
      // Une gamme ou un article est cité sans question précise → on le présente.
      const item = this.kb.itemIn(text);
      reply = item ? this.itemReply(item) : this.productReply(found[0].product);
      this.ctx.lastIntent = 'products';
    } else if (quantity && (this.ctx.product || this.ctx.lastIntent)) {
      // « Et pour 500 ? » → suite de la question précédente.
      reply = this.answerIntents(['moq'], u);
    } else if (country && !smallTalk.length) {
      reply = this.answerIntents(['shipping'], u);
    } else if (smallTalk.length && u.words.length <= 6) {
      reply = this.answerIntents([smallTalk[0]], u);
    }

    // Recherche dans tout le contenu du site.
    if (!reply) {
      const hits = this.kb.search(text, { limit: 4, prefix: false });
      if (hits.length && hits[0].score >= 3) reply = this.searchReply(hits);
    }
    if (!reply && smallTalk.length) reply = this.answerIntents([smallTalk[0]], u);

    if (!reply) {
      this.ctx.fallbacks++;
      reply = this.ctx.fallbacks >= 2
        ? this.reply('a.fallbackHuman', {}, { chips: [this.chip('handoff'), this.chip('contact'), this.chip('quote')], links: this.contactLinks() })
        : this.reply('a.fallback', {}, { chips: [this.chip('products'), this.chip('quote'), this.chip('shipping'), this.chip('handoff')] });
    } else {
      this.ctx.fallbacks = 0;
    }

    // Le visiteur écrit dans une autre langue que celle du site → proposer de basculer.
    const l = detectLang(text);
    if (l && l !== this.lang.current() && !this.ctx.langOffered) {
      this.ctx.langOffered = true;
      const opt = LANGUAGES.find(x => x.code === l)!;
      reply.chips = [{ label: `🌐 ${opt.label}`, action: 'lang', lang: l }, ...(reply.chips ?? [])];
    }
    return reply;
  }

  /** Répond à une ou plusieurs intentions (deux au maximum, plus le contrôle du minimum si une quantité est citée). */
  private answerIntents(intents: Intent[], u: Utterance, productInMessage = false, fixedProduct?: string | null): Reply {
    let list = [...new Set(intents)].sort((a, b) => INTENT_PRIORITY.indexOf(a) - INTENT_PRIORITY.indexOf(b));
    const businessCount = list.filter(i => !SMALL_TALK.includes(i)).length;
    if (businessCount > 1) list = list.filter(i => i !== 'products' && !SMALL_TALK.includes(i));
    if (list.includes('human')) list = list.filter(i => i !== 'contact');
    if (list.includes('order')) list = list.filter(i => i !== 'quote');
    if (list.includes('shipping')) list = list.filter(i => i !== 'countries');
    if (list.includes('price') && list.includes('quote')) list = list.filter(i => i !== 'quote');
    // « Minimum de commande » : la question porte sur le MOQ, pas sur une commande.
    if (list.includes('moq')) list = list.filter(i => i !== 'order' && i !== 'quote');
    // Une quantité citée avec une question de prix / devis → on vérifie aussi le minimum de commande.
    const checkQty = !!this.turnQty && !list.includes('moq') && list.some(i => ['price', 'quote', 'order'].includes(i));
    list = list.slice(0, 2);
    if (checkQty) list.push('moq');

    // Gamme concernée : citée dans le message, sinon évoquée juste avant, sinon page consultée.
    const slug = fixedProduct !== undefined ? fixedProduct
      : list.some(i => PRODUCT_AWARE.includes(i)) ? (this.ctx.product ?? this.pageProduct()) : undefined;
    const product = slug ? this.kb.products().find(p => p.slug === slug) : undefined;
    // « Quels produits avez-vous ? » : liste complète, sauf si une gamme est citée ou désignée (« ceux-là »).
    const productFor = (i: Intent) => (i === 'products' && !productInMessage && !FOLLOW_UP.test(u.padded) ? undefined : product);

    // Article précis cité (« gants nitrile ») → mentionné dans la réponse : « Gants nitrile (Santé) ».
    const item = product && list.some(i => ['price', 'quote', 'order', 'branding', 'moq'].includes(i)) ? this.kb.itemIn(u.text) : null;
    const label = item && product && item.doc.product === product.slug ? `${item.doc.title.split(' — ')[0]} (${product.name})` : undefined;

    const parts = list.map(i => this.answer(i, u, productFor(i), label));
    this.ctx.lastIntent = list[0];
    return merge(parts);
  }

  private answer(intent: Intent, u: Utterance, product?: LocalizedProduct, label?: string): Reply {
    const company = this.kb.company();
    const p = product ? { product: label ?? product.name } : {};
    const qty = this.turnQty;
    switch (intent) {
      case 'greeting': return this.reply('a.greeting', {}, { chips: this.starterChips() });
      case 'howareyou': return this.reply('a.howareyou', {}, { chips: this.starterChips() });
      case 'thanks': return this.reply('a.thanks', {}, { chips: [this.chip('quote'), this.chip('handoff')] });
      case 'bye': return this.reply('a.bye', { email: company.email });
      case 'bot': return this.reply('a.bot', {}, { chips: [this.chip('products'), this.chip('handoff')] });
      case 'yes': return this.reply('a.yes', {}, { chips: this.starterChips() });
      case 'no': return this.reply('a.no');

      case 'price':
        return this.reply(product ? 'a.priceProduct' : 'a.price', p, {
          links: [this.quoteLink(product)],
          chips: [this.chip('moq', product), this.chip('savings'), this.chip('leadtime')],
        });
      case 'savings':
        return this.reply('a.savings', {}, { links: [this.quoteLink(product)], chips: [this.chip('quality'), this.chip('process')] });
      case 'quote':
      case 'order':
        return this.reply(product ? 'a.quoteProduct' : 'a.quote', p, {
          links: [this.quoteLink(product), this.pageLink('/how-it-works', 'nav.howItWorks')],
          chips: [this.chip('handoff'), this.chip('payment'), this.chip('leadtime')],
        });
      case 'moq': {
        const key = qty ? (qty >= 50 ? 'a.moqOk' : 'a.moqLow') : 'a.moq';
        return this.reply(key, { qty: qty ? qty.toLocaleString(this.lang.locale()) : '', ...p }, {
          links: [this.quoteLink(product)], chips: [this.chip('branding', product), this.chip('price', product)],
        });
      }
      case 'branding':
        return this.reply(product ? 'a.brandingProduct' : 'a.branding', p, {
          links: [this.quoteLink(product)], chips: [this.chip('sample'), this.chip('moq', product)],
        });
      case 'sample':
        return this.reply('a.sample', {}, { links: [this.quoteLink(product)], chips: [this.chip('handoff'), this.chip('branding')] });
      case 'leadtime':
        return this.reply('a.leadtime', {}, { links: [this.pageLink('/how-it-works', 'nav.howItWorks')], chips: [this.chip('shipping'), this.chip('payment')] });
      case 'shipping':
      case 'countries':
        return this.shippingReply(intent);
      case 'ddp':
        return this.reply('a.ddp', {}, { chips: [this.chip('shipping'), this.chip('payment')] });
      case 'payment':
        return this.reply('a.payment', {}, { links: [this.pageLink('/how-it-works', 'nav.howItWorks')], chips: [this.chip('quality'), this.chip('quote')] });
      case 'quality':
        return this.reply('a.quality', {}, { chips: [this.chip('factory'), this.chip('sample')] });
      case 'languages':
        return this.reply('a.languages', { languages: company.languages.join(', ') }, { chips: [this.chip('contact'), this.chip('handoff')] });
      case 'contact':
        return this.reply('a.contact', { email: company.email, phones: CONTACT.phones.join(' · ') || '—' }, { links: this.contactLinks(), chips: [this.chip('handoff'), this.chip('location')] });
      case 'location': {
        const hubs = SOURCING_NETWORK.map(n => n.place).join(', ');
        return this.reply('a.location', { location: company.location, hubs }, { links: [this.pageLink('/about', 'nav.about'), this.pageLink('/contact', 'nav.contact')], chips: [this.chip('factory')] });
      }
      case 'about':
        return {
          text: `**${company.name}** — ${company.tagline}.\n\n${company.intro}\n\n${company.promise.map(x => '✓ ' + x).join('\n')}`,
          links: [this.pageLink('/about', 'nav.about')], chips: [this.chip('products'), this.chip('factory'), this.chip('quality')],
        };
      case 'factory': {
        const net = this.lang.list('data.network', SOURCING_NETWORK).map(n => `• **${n.place}** — ${n.detail}`).join('\n');
        return this.reply('a.factory', { list: net }, { links: [this.pageLink('/about', 'nav.about')], chips: [this.chip('quality'), this.chip('products')] });
      }
      case 'process': {
        const steps = this.lang.list('data.steps', STEPS).map(s => `**${s.n}. ${s.title}** — ${s.text}`).join('\n');
        return this.reply('a.process', { steps }, { links: [this.pageLink('/how-it-works', 'nav.howItWorks'), this.quoteLink(product)], chips: [this.chip('payment'), this.chip('leadtime')] });
      }
      case 'catalog':
        return this.reply('a.catalog', { email: company.email }, {
          links: [this.pageLink('/products', 'nav.products'), { label: company.email, href: this.mailto(this.tr('assistant.h.catalogSubject')), icon: 'mail' }],
          chips: [this.chip('products')],
        });
      case 'news': {
        const news = this.store.publishedAnnouncements().slice(0, 3).map(a => this.lang.announcement(a));
        return this.reply(news.length ? 'a.news' : 'a.noNews', {}, {
          cards: news.map(a => ({ title: a.title, text: a.excerpt, image: img(a.image, 160, 160), url: `/news/${a.id}` })),
          links: [this.pageLink('/news', 'nav.news')],
        });
      }
      case 'human':
        return this.startHandoff();
      case 'products': {
        const item = this.kb.itemIn(u.text);
        if (item) return this.itemReply(item);
        if (product) return this.productReply(product);
        // Demande d'un produit absent du catalogue (« vous vendez des ordinateurs ? »).
        const meaningful = u.words.filter(w => w.length > 3).length;
        const asksSpecific = meaningful >= 3 && !/\b(products?|produits?|productos?|produtos?|range|gammes?)\b/.test(u.padded);
        if (asksSpecific) {
          return this.reply('a.customSourcing', {}, { links: [this.quoteLink(), this.pageLink('/products', 'nav.products')], chips: [this.chip('handoff'), this.chip('factory')] });
        }
        return this.reply('a.products', { count: this.kb.products().length }, {
          cards: this.kb.products().map(x => ({ title: x.name, text: x.short, image: img(x.image, 160, 160), url: `/products/${x.slug}` })),
          links: [this.pageLink('/products', 'nav.products')],
          chips: [this.chip('moq'), this.chip('branding'), this.chip('price')],
        });
      }
    }
  }

  private shippingReply(intent: Intent): Reply {
    const c = this.ctx.country;
    const chips = [this.chip('ddp'), this.chip('leadtime'), this.chip('quote')];
    const links = [this.pageLink('/markets', 'nav.markets')];
    if (!c) {
      const markets = this.lang.list('data.markets', MARKETS).map(m => `${m.flag} ${m.name}`).join(' · ');
      const logistics = this.lang.list('data.logistics', LOGISTICS).slice(0, 2).map(l => `• ${l.title}`).join('\n');
      return this.reply(intent === 'countries' ? 'a.countries' : 'a.shipping', { markets, logistics }, { links, chips });
    }
    const labels = this.lang.t<string[]>('quote.countries', QUOTE_COUNTRIES);
    const country = (Array.isArray(labels) ? labels : QUOTE_COUNTRIES)[QUOTE_COUNTRIES.indexOf(c)] ?? c;
    const key = c === 'Other' ? 'a.shippingOther' : AFRICA.includes(c) ? 'a.shippingAfrica' : 'a.shippingCountry';
    return this.reply(key, { country }, { links: [...links, { ...this.quoteLink(), queryParams: undefined }], chips });
  }

  private productReply(p: LocalizedProduct): Reply {
    const items = p.items.slice(0, 6).map(i => '• ' + i).join('\n') + (p.items.length > 6 ? '\n• …' : '');
    return {
      text: `**${p.name}** — ${p.short}\n\n${items}\n\n${this.tr('assistant.a.industries')} ${p.industries.join(', ')}.\n${this.tr('assistant.a.hub')} ${p.hub}.`,
      cards: [{ title: p.name, text: p.short, image: img(p.image, 160, 160), url: `/products/${p.slug}` }],
      links: [this.quoteLink(p)],
      chips: this.productChips(p),
    };
  }

  private itemReply(hit: SearchHit): Reply {
    const p = this.kb.products().find(x => x.slug === hit.doc.product)!;
    this.ctx.product = p.slug;
    return this.reply('a.itemFound', { item: hit.doc.title, product: p.name }, {
      links: [{ label: p.name, url: `/products/${p.slug}`, icon: 'arrow' }, this.quoteLink(p)],
      chips: this.productChips(p),
    });
  }

  /** Réponse construite à partir des meilleurs résultats de la recherche plein texte. */
  private searchReply(hits: SearchHit[]): Reply {
    const top = hits[0].doc;
    if (top.type === 'item') return this.itemReply(hits[0]);
    if (top.type === 'product') {
      const p = this.kb.products().find(x => x.slug === top.product);
      if (p) { this.ctx.product = p.slug; return this.productReply(p); }
    }
    let text: string;
    if (top.type === 'faq') text = `**${top.title}**\n${top.body}`;
    else text = `${this.tr('assistant.a.found')}\n\n**${top.title}**\n${truncate(top.body, 280)}`;
    const related = hits.slice(1).filter(h => h.score >= hits[0].score * 0.5 && h.doc.url !== top.url).slice(0, 2);
    return {
      text,
      links: [
        { label: top.type === 'faq' ? this.tr('faq.seeAll') : top.title, url: top.url, queryParams: top.queryParams, icon: 'arrow' },
        ...related.map(h => ({ label: h.doc.title, url: h.doc.url, queryParams: h.doc.queryParams, icon: 'arrow' })),
      ],
      chips: [this.chip('quote'), this.chip('handoff')],
    };
  }

  // ---------- Transfert vers un conseiller ----------

  private startHandoff(): Reply {
    this.ctx.handoff = { step: 'name' };
    return this.reply('h.askName', {}, { chips: [this.chip('cancel')], links: this.contactLinks() });
  }

  private async continueHandoff(text: string): Promise<Reply> {
    const h = this.ctx.handoff!;
    if (CANCEL.test(new Utterance(text).padded)) {
      this.ctx.handoff = undefined;
      return this.reply('h.cancelled', {}, { chips: this.starterChips() });
    }
    const cancel = [this.chip('cancel')];
    switch (h.step) {
      case 'name':
        h.name = text.replace(/^(my name is|i am|i'm|je m'appelle|je suis|moi c'est|me llamo|soy|meu nome e|meu nome é|sou|我叫|我是)\s*/i, '').slice(0, 80);
        h.step = 'email';
        return this.reply('h.askEmail', { name: h.name }, { chips: cancel });
      case 'email': {
        const email = text.match(EMAIL)?.[0];
        if (!email) return this.reply('h.invalidEmail', {}, { chips: cancel });
        h.email = email;
        h.step = 'message';
        return this.reply('h.askMessage', {}, { chips: cancel });
      }
      case 'message': {
        this.ctx.handoff = undefined;
        const transcript = this.messages().slice(-16).map(m => `${m.from === 'user' ? '👤' : '🤖'} ${m.text}`).join('\n');
        const msg = {
          name: h.name || '—',
          email: h.email!,
          subject: this.tr('assistant.h.subject'),
          message: `${text}\n\n——— ${this.tr('assistant.h.transcript')} ———\n${transcript}`,
        };
        this.store.addMessage(msg); // visible dans le back-office (Messages)
        try {
          await this.mail.sendContact(msg);
          return this.reply('h.sent', { name: msg.name, email: msg.email }, { chips: [this.chip('products'), this.chip('quote')] });
        } catch {
          return this.reply('h.sentLocal', { email: this.kb.company().email }, { links: this.contactLinks() });
        }
      }
    }
  }

  // ---------- Aides ----------

  private tr(key: string, params: Record<string, unknown> = {}): string {
    const v = this.translate.instant(key, params);
    return typeof v === 'string' ? v : key;
  }

  private reply(key: string, params: Record<string, unknown> = {}, extra: Omit<Reply, 'text'> = {}): Reply {
    return { text: this.tr('assistant.' + key, params), ...extra };
  }

  private chip(action: Exclude<ChipAction, 'lang' | 'restart'>, product?: LocalizedProduct): ChatChip {
    const label = product && ['price', 'moq', 'branding'].includes(action)
      ? this.tr(`assistant.chips.${action}Product`, { product: product.name })
      : this.tr('assistant.chips.' + action);
    return { label, action, product: product?.slug };
  }

  private starterChips(): ChatChip[] {
    return [this.chip('products'), this.chip('quote'), this.chip('moq'), this.chip('leadtime'), this.chip('shipping'), this.chip('handoff')];
  }

  private productChips(p: LocalizedProduct): ChatChip[] {
    return [this.chip('price', p), this.chip('moq', p), this.chip('branding', p), this.chip('leadtime')];
  }

  private quoteLink(p?: LocalizedProduct): ChatLink {
    return p
      ? { label: this.tr('assistant.links.quoteFor', { product: p.name }), url: '/quote', queryParams: { line: p.rawName }, icon: 'file' }
      : { label: this.tr('common.requestQuote'), url: '/quote', icon: 'file' };
  }

  private pageLink(url: string, key: string): ChatLink {
    return { label: this.tr(key), url, icon: 'arrow' };
  }

  private mailto(subject: string) {
    return `mailto:${this.kb.company().email}?subject=${encodeURIComponent(subject)}`;
  }

  private contactLinks(): ChatLink[] {
    const links: ChatLink[] = CONTACT.phones.slice(0, 1).map(p => ({ label: p, href: telHref(p), icon: 'phone' }));
    if (CONTACT.whatsapp) links.push({ label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}`, external: true, icon: 'chat' });
    links.push({ label: this.tr('assistant.links.email'), href: this.mailto(this.tr('assistant.h.subject')), icon: 'mail' });
    return links;
  }
}

/** Fusionne plusieurs réponses en une seule (texte, liens et suggestions sans doublons). */
function merge(parts: Reply[]): Reply {
  if (parts.length === 1) return parts[0];
  const uniq = <T extends { label: string }>(xs: T[]) => xs.filter((x, i) => xs.findIndex(y => y.label === x.label) === i);
  return {
    text: parts.map(p => p.text).join('\n\n'),
    links: uniq(parts.flatMap(p => p.links ?? [])).slice(0, 4),
    chips: uniq(parts.flatMap(p => p.chips ?? [])).slice(0, 4),
    cards: parts.flatMap(p => p.cards ?? []),
  };
}

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n) > n * 0.6 ? s.lastIndexOf(' ', n) : n) + '…' : s);
