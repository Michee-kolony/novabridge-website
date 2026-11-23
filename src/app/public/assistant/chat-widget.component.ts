import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AssistantService, ChatChip } from '../../core/assistant/assistant.service';
import { CookieConsentService } from '../../core/cookies/cookie-consent.service';
import { SiteSearchService } from '../search/site-search.component';

const GAP = 24;
const TEASER_KEY = 'nb-assistant-teaser';

/** Assistant virtuel : bouton flottant + fenêtre de discussion (plein écran sur mobile). */
@Component({
  selector: 'nb-chat-widget',
  standalone: false,
  template: `
  <!-- Bulle d'accroche -->
  @if (teaser() && !bot.open()) {
    <div class="fixed right-[88px] z-[64] flex max-w-[240px] items-start gap-2 rounded-2xl rounded-br-md bg-white p-4 text-sm text-slate shadow-nb-lg animate-[nbpop_.35s_ease-out] sm:right-[92px]"
         [style.bottom.px]="bottom()">
      <button type="button" class="flex-1 text-left" (click)="openChat()">{{ 'assistant.teaser' | translate }}</button>
      <button type="button" class="-mr-1 -mt-1 rounded p-1 text-steel hover:text-navy" (click)="dismissTeaser()" [attr.aria-label]="'assistant.ui.close' | translate">
        <nb-icon name="close" class="h-3.5 w-3.5" />
      </button>
    </div>
  }

  <!-- Bouton flottant -->
  <button type="button" (click)="bot.open() ? bot.close() : openChat()"
          [style.bottom.px]="bottom()"
          [attr.aria-label]="(bot.open() ? 'assistant.ui.close' : 'assistant.ui.open') | translate"
          [attr.aria-expanded]="bot.open()" aria-controls="nb-chat-panel"
          class="group fixed right-5 z-[66] flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-nb-lg transition-all duration-300 hover:-translate-y-1 hover:bg-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-6"
          [class.max-sm:hidden]="bot.open()">
    @if (!bot.open()) { <span class="absolute inset-0 animate-ping rounded-full bg-gold/30 [animation-iteration-count:3]"></span> }
    <nb-icon [name]="bot.open() ? 'close' : 'chat'" class="relative h-7 w-7" />
    @if (bot.unread() && !bot.open()) {
      <span class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-navy">{{ bot.unread() }}</span>
    }
  </button>

  <!-- Fenêtre de discussion -->
  @if (bot.open()) {
    <section id="nb-chat-panel" role="dialog" aria-modal="false" [attr.aria-label]="'assistant.ui.title' | translate"
             class="fixed inset-0 z-[67] flex flex-col overflow-hidden bg-cloud shadow-nb-lg animate-[nbpop_.3s_ease-out] sm:inset-auto sm:right-6 sm:h-[min(640px,calc(100vh-140px))] sm:w-[390px] sm:rounded-2xl"
             [style.bottom.px]="isMobile() ? 0 : bottom() + 70">
      <!-- En-tête -->
      <header class="flex items-center gap-3 bg-navy px-4 py-3.5 text-white">
        <span class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <img src="logos/icone-app-or.svg" alt="" class="h-6 w-6">
          <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#3BD188] ring-2 ring-navy"></span>
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-display text-sm font-bold">{{ 'assistant.ui.title' | translate }}</p>
          <p class="truncate text-xs text-[#C9D3E0]">{{ 'assistant.ui.status' | translate }}</p>
        </div>
        <button type="button" (click)="bot.restart()" class="rounded-full p-2 text-[#C9D3E0] transition hover:bg-white/10 hover:text-white" [attr.title]="'assistant.ui.restart' | translate" [attr.aria-label]="'assistant.ui.restart' | translate">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>
        </button>
        <button type="button" (click)="bot.close()" class="rounded-full p-2 text-[#C9D3E0] transition hover:bg-white/10 hover:text-white" [attr.aria-label]="'assistant.ui.close' | translate">
          <nb-icon name="close" class="h-5 w-5" />
        </button>
      </header>

      <!-- Messages -->
      <div #scroller class="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite" aria-relevant="additions">
        @for (m of bot.messages(); track m.id; let last = $last) {
          @if (m.from === 'user') {
            <div class="flex justify-end">
              <p class="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-sm text-white">{{ m.text }}</p>
            </div>
          } @else {
            <div class="flex items-end gap-2">
              <span class="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy"><img src="logos/icone-app-or.svg" alt="" class="h-4 w-4"></span>
              <div class="min-w-0 max-w-[88%] space-y-2">
                <div class="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-slate shadow-nb-sm">
                  @for (line of m.lines; track $index) {
                    @if (line.length) {
                      <p class="break-words" [class.mt-1]="$index > 0">@for (s of line; track $index) {@if (s.strong) {<strong class="font-semibold text-navy">{{ s.text }}</strong>} @else {<span>{{ s.text }}</span>}}</p>
                    } @else { <div class="h-2"></div> }
                  }
                </div>

                @if (m.cards?.length) {
                  <div class="-mr-4 flex snap-x gap-2 overflow-x-auto pb-1 pr-4">
                    @for (c of m.cards; track c.url) {
                      <a [routerLink]="c.url" [queryParams]="c.queryParams" (click)="onNavigate()"
                         class="flex w-56 shrink-0 snap-start gap-3 rounded-xl border border-mist bg-white p-2.5 transition hover:border-gold hover:shadow-nb-sm">
                        @if (c.image) { <img [src]="c.image" alt="" loading="lazy" class="h-14 w-14 shrink-0 rounded-lg object-cover"> }
                        <span class="min-w-0">
                          <span class="block truncate text-xs font-bold text-navy">{{ c.title }}</span>
                          <span class="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-steel">{{ c.text }}</span>
                        </span>
                      </a>
                    }
                  </div>
                }

                @if (m.links?.length) {
                  <div class="flex flex-wrap gap-1.5">
                    @for (l of m.links; track l.label) {
                      @if (l.url) {
                        <a [routerLink]="l.url" [queryParams]="l.queryParams" (click)="onNavigate()" class="chat-link">
                          <nb-icon [name]="l.icon || 'arrow'" class="h-3.5 w-3.5" />{{ l.label }}</a>
                      } @else {
                        <a [href]="l.href" [attr.target]="l.external ? '_blank' : null" [attr.rel]="l.external ? 'noopener noreferrer' : null" class="chat-link">
                          @if (l.icon === 'phone') { <nb-social-icon name="phone" class="h-3.5 w-3.5" /> } @else { <nb-icon [name]="l.icon || 'external'" class="h-3.5 w-3.5" /> }
                          {{ l.label }}</a>
                      }
                    }
                  </div>
                }

                @if (last && m.chips?.length && !bot.typing()) {
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    @for (c of m.chips; track c.label) {
                      <button type="button" (click)="choose(c)"
                              class="rounded-full border border-gold/60 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-gold hover:bg-gold hover:text-navy">{{ c.label }}</button>
                    }
                  </div>
                }
              </div>
            </div>
          }
        }

        @if (bot.typing()) {
          <div class="flex items-end gap-2" [attr.aria-label]="'assistant.ui.typing' | translate">
            <span class="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy"><img src="logos/icone-app-or.svg" alt="" class="h-4 w-4"></span>
            <div class="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-nb-sm">
              <span class="h-2 w-2 animate-bounce rounded-full bg-steel/60"></span>
              <span class="h-2 w-2 animate-bounce rounded-full bg-steel/60 [animation-delay:.15s]"></span>
              <span class="h-2 w-2 animate-bounce rounded-full bg-steel/60 [animation-delay:.3s]"></span>
            </div>
          </div>
        }
      </div>

      <!-- Saisie -->
      <form (submit)="submit($event)" class="border-t border-mist bg-white p-3">
        <div class="flex items-end gap-2 rounded-2xl border border-mist bg-cloud px-3 py-2 transition focus-within:border-gold focus-within:bg-white">
          <textarea #input rows="1" [value]="draft()" (input)="onInput($event)" (keydown)="onKey($event)" maxlength="600"
                    [attr.placeholder]="'assistant.ui.placeholder' | translate" [attr.aria-label]="'assistant.ui.placeholder' | translate"
                    class="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-navy outline-none placeholder:text-steel"></textarea>
          <button type="submit" [disabled]="!draft().trim()" [attr.aria-label]="'assistant.ui.send' | translate"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-navy transition hover:bg-gold-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
        <p class="mt-2 text-center text-[10.5px] text-steel">{{ 'assistant.ui.note' | translate }}</p>
      </form>
    </section>
  }
  `,
  styles: [`
    :host ::ng-deep .chat-link { display: inline-flex; align-items: center; gap: .375rem; border-radius: 9999px; background: #0B1F3A; color: #fff; padding: .375rem .75rem; font-size: .75rem; font-weight: 600; transition: background-color .2s, color .2s; }
    :host ::ng-deep .chat-link:hover { background: #C9A24B; color: #0B1F3A; }
    @keyframes nbpop { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
  `],
})
export class ChatWidgetComponent implements AfterViewChecked, OnDestroy {
  readonly bot = inject(AssistantService);
  private consent = inject(CookieConsentService);
  private document = inject(DOCUMENT);
  private search = inject(SiteSearchService);

  @ViewChild('scroller') private scroller?: ElementRef<HTMLElement>;
  @ViewChild('input') private input?: ElementRef<HTMLTextAreaElement>;

  readonly draft = signal('');
  readonly teaser = signal(false);
  readonly isMobile = signal(false);
  private bannerHeight = signal(0);
  /** Comme le bouton « retour en haut » : se place au-dessus du bandeau cookies s'il est affiché. */
  readonly bottom = computed(() => (this.consent.bannerVisible() ? this.bannerHeight() : 0) + GAP);
  private lastCount = 0;
  private teaserTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.measure();
    try { if (!sessionStorage.getItem(TEASER_KEY)) this.teaserTimer = setTimeout(() => this.teaser.set(true), 8000); } catch { /* ignore */ }
    // Focus sur le champ à l'ouverture.
    effect(() => { if (this.bot.open()) setTimeout(() => this.input?.nativeElement.focus(), 50); });
  }

  ngAfterViewChecked() {
    const count = this.bot.messages().length + (this.bot.typing() ? 1 : 0);
    if (count !== this.lastCount && this.scroller) {
      this.lastCount = count;
      const el = this.scroller.nativeElement;
      // Fait défiler jusqu'au début du dernier message (lisible même s'il est long).
      const last = el.lastElementChild as HTMLElement | null;
      el.scrollTo({ top: last ? Math.max(0, last.offsetTop - 12) : el.scrollHeight, behavior: 'smooth' });
    }
  }

  ngOnDestroy() { clearTimeout(this.teaserTimer); }

  openChat() {
    this.dismissTeaser();
    this.bot.show();
  }

  dismissTeaser() {
    this.teaser.set(false);
    clearTimeout(this.teaserTimer);
    try { sessionStorage.setItem(TEASER_KEY, '1'); } catch { /* ignore */ }
  }

  choose(c: ChatChip) { this.bot.choose(c); }

  onInput(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    this.draft.set(ta.value);
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 112) + 'px';
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); this.submit(e); }
  }

  submit(e: Event) {
    e.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    this.bot.send(text);
    this.draft.set('');
    if (this.input) { this.input.nativeElement.value = ''; this.input.nativeElement.style.height = 'auto'; }
  }

  /** Sur mobile, la fenêtre (plein écran) se ferme quand on suit un lien. */
  onNavigate() { if (this.isMobile()) this.bot.close(); }

  @HostListener('document:keydown.escape')
  onEscape() { if (this.bot.open() && !this.search.open()) this.bot.close(); }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  measure() {
    const win = this.document.defaultView;
    this.isMobile.set(!!win && win.innerWidth < 640);
    const banner = this.document.querySelector<HTMLElement>('nb-cookie-banner > div');
    this.bannerHeight.set(banner?.offsetHeight ?? 0);
  }
}
