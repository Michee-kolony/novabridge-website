import { Component, ElementRef, HostListener, Injectable, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { DocType, KnowledgeService, SearchHit } from '../../core/assistant/knowledge.service';
import { AssistantService } from '../../core/assistant/assistant.service';
import { LanguageService } from '../../core/services/language.service';
import { TextSegment } from '../../core/assistant/text';

/** Ouverture de la recherche depuis n'importe quel bouton du site. */
@Injectable({ providedIn: 'root' })
export class SiteSearchService {
  readonly open = signal(false);
  readonly query = signal('');
  show(query = '') { this.query.set(query); this.open.set(true); }
  close() { this.open.set(false); }
}

const TYPE_ORDER: DocType[] = ['product', 'item', 'faq', 'page', 'news', 'market', 'info'];
const TYPE_ICON: Record<DocType, string> = { product: 'box', item: 'check', faq: 'chat', page: 'file', news: 'megaphone', market: 'globe', info: 'star' };

interface ResultRow { hit: SearchHit; title: TextSegment[]; snippet: TextSegment[]; icon: string; index: number; }
interface ResultGroup { type: DocType; rows: ResultRow[]; }

/**
 * Recherche instantanée dans tout le site (statique) : pages, gammes, articles du catalogue, FAQ,
 * actualités, marchés. Résultats au fil de la frappe, fautes de frappe tolérées, navigation au clavier.
 * Raccourcis : Ctrl/⌘ + K ou « / ».
 */
@Component({
  selector: 'nb-site-search',
  standalone: false,
  template: `
  @if (ui.open()) {
    <div class="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[8vh] sm:px-6 sm:pt-[12vh]" role="dialog" aria-modal="true" [attr.aria-label]="'search.title' | translate">
      <button type="button" class="absolute inset-0 cursor-default bg-navy-900/70 backdrop-blur-sm animate-[nbfade_.2s_ease-out]" (click)="ui.close()" tabindex="-1" [attr.aria-label]="'assistant.ui.close' | translate"></button>

      <div class="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-nb-lg animate-[nbdrop_.25s_ease-out]">
        <!-- Barre de recherche -->
        <div class="flex items-center gap-3 border-b border-mist px-4 sm:px-5">
          <nb-icon name="search" class="h-5 w-5 text-navy" />
          <input #input type="search" [value]="ui.query()" (input)="ui.query.set($any($event.target).value); active.set(0)" (keydown)="onKey($event)"
                 [attr.placeholder]="'search.placeholder' | translate" [attr.aria-label]="'search.placeholder' | translate"
                 role="combobox" aria-autocomplete="list" aria-controls="nb-search-results" [attr.aria-expanded]="!!rows().length"
                 [attr.aria-activedescendant]="rows().length ? 'nb-sr-' + active() : null"
                 autocomplete="off" spellcheck="false" enterkeyhint="search"
                 class="h-16 flex-1 bg-transparent text-base text-navy outline-none placeholder:text-steel [&::-webkit-search-cancel-button]:hidden">
          @if (ui.query()) {
            <button type="button" (click)="ui.query.set(''); input.focus()" class="rounded-full p-1.5 text-steel hover:bg-cloud hover:text-navy" [attr.aria-label]="'search.clear' | translate">
              <nb-icon name="close" class="h-4 w-4" />
            </button>
          }
          <kbd class="hidden rounded border border-mist px-1.5 py-0.5 text-[11px] font-semibold text-steel sm:block">Esc</kbd>
        </div>

        <div id="nb-search-results" role="listbox" class="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
          @if (!ui.query().trim()) {
            <!-- Suggestions -->
            <div class="p-3">
              @if (recent().length) {
                <p class="overline mb-3">{{ 'search.recent' | translate }}</p>
                <div class="mb-6 flex flex-wrap gap-2">
                  @for (r of recent(); track r) {
                    <button type="button" (click)="ui.query.set(r)" class="flex items-center gap-1.5 rounded-full bg-cloud px-3 py-1.5 text-sm text-navy hover:bg-mist">
                      <nb-icon name="clock" class="h-3.5 w-3.5" />{{ r }}</button>
                  }
                </div>
              }
              <p class="overline mb-3">{{ 'search.popular' | translate }}</p>
              <div class="flex flex-wrap gap-2">
                @for (s of popular(); track s) {
                  <button type="button" (click)="ui.query.set(s); input.focus()" class="rounded-full border border-mist px-3 py-1.5 text-sm text-navy transition hover:border-gold hover:bg-ivory">{{ s }}</button>
                }
              </div>
              <p class="overline mb-3 mt-6">{{ 'search.quickLinks' | translate }}</p>
              <div class="grid gap-2 sm:grid-cols-2">
                @for (l of quickLinks; track l.url) {
                  <a [routerLink]="l.url" (click)="ui.close()" class="flex items-center gap-3 rounded-xl border border-mist p-3 text-sm font-semibold text-navy transition hover:border-gold hover:bg-ivory">
                    <nb-icon [name]="l.icon" class="h-5 w-5" />{{ l.label | translate }}</a>
                }
              </div>
            </div>
          } @else if (!rows().length) {
            <!-- Aucun résultat -->
            <div class="px-4 py-10 text-center">
              <nb-icon name="search" class="mx-auto h-10 w-10 text-mist" />
              <p class="mt-4 font-display font-bold text-navy">{{ 'search.noResults' | translate: { query: ui.query() } }}</p>
              <p class="mt-1 text-sm text-steel">{{ 'search.noResultsHint' | translate }}</p>
              <button type="button" (click)="ask()" class="btn btn-gold mt-6"><nb-icon name="chat" class="h-5 w-5" />{{ 'search.askAssistant' | translate }}</button>
            </div>
          } @else {
            <p class="sr-only" aria-live="polite">{{ 'search.count' | translate: { count: rows().length } }}</p>
            @for (g of groups(); track g.type) {
              <p class="overline px-3 pb-1.5 pt-3">{{ 'search.types.' + g.type | translate }}</p>
              @for (r of g.rows; track r.hit.doc.id) {
                <a [id]="'nb-sr-' + r.index" role="option" [attr.aria-selected]="active() === r.index"
                   [routerLink]="r.hit.doc.url" [queryParams]="r.hit.doc.queryParams" (click)="remember(); ui.close()" (mouseenter)="active.set(r.index)"
                   class="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors" [class]="active() === r.index ? 'bg-ivory' : ''">
                  @if (r.hit.doc.image) {
                    <img [src]="r.hit.doc.image" alt="" loading="lazy" class="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-cover">
                  } @else {
                    <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cloud text-navy"><nb-icon [name]="r.icon" class="h-5 w-5" /></span>
                  }
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold text-navy">@for (s of r.title; track $index) {@if (s.mark) {<mark class="rounded bg-gold-light px-0.5 text-navy">{{ s.text }}</mark>} @else {<span>{{ s.text }}</span>}}</span>
                    <span class="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-steel">@for (s of r.snippet; track $index) {@if (s.mark) {<mark class="bg-transparent font-semibold text-navy">{{ s.text }}</mark>} @else {<span>{{ s.text }}</span>}}</span>
                  </span>
                  <nb-icon name="arrow" class="mt-3 h-4 w-4 shrink-0 text-gold transition-opacity" [class.opacity-0]="active() !== r.index" />
                </a>
              }
            }
            <!-- Demander à l'assistant -->
            <button type="button" [id]="'nb-sr-' + rows().length" role="option" [attr.aria-selected]="active() === rows().length"
                    (click)="ask()" (mouseenter)="active.set(rows().length)"
                    class="mt-2 flex w-full items-center gap-3 rounded-xl border-t border-mist px-3 py-3 text-left text-sm transition-colors" [class]="active() === rows().length ? 'bg-ivory' : ''">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy"><img src="logos/icone-app-or.svg" alt="" class="h-5 w-5"></span>
              <span class="min-w-0 flex-1 text-navy">{{ 'search.askAbout' | translate }} <strong>« {{ ui.query() }} »</strong></span>
            </button>
          }
        </div>

        <div class="hidden items-center gap-4 border-t border-mist bg-cloud px-5 py-2.5 text-[11px] text-steel sm:flex">
          <span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> {{ 'search.navigate' | translate }}</span>
          <span><kbd class="kbd">↵</kbd> {{ 'search.select' | translate }}</span>
          <span class="ml-auto"><kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd></span>
        </div>
      </div>
    </div>
  }
  `,
  styles: [`
    .kbd { display: inline-block; min-width: 1.25rem; border: 1px solid #E3E8EF; border-radius: .25rem; background: #fff; padding: 0 .3rem; text-align: center; font-weight: 600; }
    @keyframes nbfade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes nbdrop { from { opacity: 0; transform: translateY(-12px) scale(.98); } to { opacity: 1; transform: none; } }
  `],
})
export class SiteSearchComponent {
  readonly ui = inject(SiteSearchService);
  private kb = inject(KnowledgeService);
  private bot = inject(AssistantService);
  private lang = inject(LanguageService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  @ViewChild('input') private input?: ElementRef<HTMLInputElement>;

  readonly active = signal(0);
  readonly recent = signal<string[]>([]);
  readonly popular = computed(() => {
    const p = this.lang.t<string[]>('search.suggestions', []);
    return Array.isArray(p) ? p : [];
  });
  readonly quickLinks = [
    { url: '/products', label: 'nav.products', icon: 'grid' },
    { url: '/quote', label: 'common.requestQuote', icon: 'file' },
    { url: '/faq', label: 'faq.kicker', icon: 'chat' },
    { url: '/contact', label: 'nav.contact', icon: 'mail' },
  ];

  /** Résultats regroupés par type (index global pour la navigation au clavier). */
  readonly groups = computed<ResultGroup[]>(() => {
    const q = this.ui.query().trim();
    if (!q) return [];
    const hits = this.kb.search(q, { limit: 14 });
    let index = 0;
    return TYPE_ORDER
      .map(type => ({ type, hits: hits.filter(h => h.doc.type === type) }))
      .filter(g => g.hits.length)
      .map(g => ({
        type: g.type,
        rows: g.hits.slice(0, g.type === 'item' ? 5 : 4).map(hit => ({
          hit,
          title: this.kb.highlight(hit.doc.title, q),
          snippet: this.kb.snippet(hit.doc.body, q, 140),
          icon: TYPE_ICON[hit.doc.type],
          index: 0,
        })),
      }))
      .map(g => ({ ...g, rows: g.rows.map(r => ({ ...r, index: index++ })) }));
  });
  readonly rows = computed(() => this.groups().flatMap(g => g.rows));

  constructor() {
    effect(() => {
      if (this.ui.open()) {
        this.active.set(0);
        this.document.body.style.overflow = 'hidden';
        setTimeout(() => this.input?.nativeElement.focus(), 30);
      } else {
        this.document.body.style.overflow = '';
      }
    });
  }

  onKey(e: KeyboardEvent) {
    const max = this.rows().length; // la dernière ligne = « demander à l'assistant »
    if (e.key === 'ArrowDown') { e.preventDefault(); this.active.set(Math.min(max, this.active() + 1)); this.scrollActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.active.set(Math.max(0, this.active() - 1)); this.scrollActive(); }
    else if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      const row = this.rows()[this.active()];
      if (row) { this.remember(); this.ui.close(); this.router.navigate([row.hit.doc.url], { queryParams: row.hit.doc.queryParams }); }
      else if (this.ui.query().trim()) this.ask();
    }
  }

  /** Transmet la recherche à l'assistant. */
  ask() {
    const q = this.ui.query().trim();
    this.remember();
    this.ui.close();
    this.bot.show(q);
  }

  remember() {
    const q = this.ui.query().trim();
    if (q.length < 2) return;
    this.recent.update(list => [q, ...list.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 5));
  }

  private scrollActive() {
    setTimeout(() => this.document.getElementById('nb-sr-' + this.active())?.scrollIntoView({ block: 'nearest' }));
  }

  @HostListener('document:keydown', ['$event'])
  onShortcut(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    const typing = !!target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.ui.open() ? this.ui.close() : this.ui.show(); }
    else if (e.key === '/' && !typing && !this.ui.open()) { e.preventDefault(); this.ui.show(); }
    else if (e.key === 'Escape' && this.ui.open()) { e.stopPropagation(); this.ui.close(); }
  }
}
