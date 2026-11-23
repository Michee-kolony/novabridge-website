import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { COMPANY, CONTACT, SOCIALS, telHref } from '../core/data/company';
import { StoreService } from '../core/services/store.service';
import { CookieConsentService } from '../core/cookies/cookie-consent.service';
import { LanguageService } from '../core/services/language.service';
import { SiteSearchService } from './search/site-search.component';

@Component({
  selector: 'nb-public-layout',
  standalone: false,
  template: `
  <!-- ===== En-tête ===== -->
  <header class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
          [class]="solid() ? 'bg-white/95 shadow-nb backdrop-blur' : 'bg-transparent'">
    <!-- Barre du haut : contacts & réseaux sociaux (se replie au défilement) -->
    <div class="overflow-hidden text-[#C9D3E0] transition-[max-height,background-color] duration-300"
         [class]="(scrolled() ? 'max-h-0 ' : 'max-h-9 ') + (isHome() && !solid() ? 'bg-navy-900/60 backdrop-blur-sm' : 'bg-navy-900')"
         [attr.aria-hidden]="scrolled() ? true : null">
      <div class="container-nb flex h-9 items-center justify-between gap-4 text-xs">
        <div class="flex min-w-0 items-center gap-4 sm:gap-6">
          @for (p of contact.phones; track p; let i = $index) {
            <a [href]="tel(p)" class="shrink-0 items-center gap-1.5 font-semibold text-white transition-colors hover:text-gold" [attr.tabindex]="scrolled() ? -1 : null"
               [class]="i === 0 ? 'flex' : 'hidden sm:flex'">
              <nb-social-icon name="phone" class="h-3.5 w-3.5 text-gold" /><span>{{ p }}</span>
            </a>
          }
          @if (contact.whatsapp) {
            <a [href]="'https://wa.me/' + contact.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="flex shrink-0 items-center gap-1.5 transition-colors hover:text-gold" [attr.tabindex]="scrolled() ? -1 : null">
              <nb-social-icon name="whatsapp" class="h-3.5 w-3.5 text-gold" /><span class="hidden sm:inline">WhatsApp</span>
            </a>
          }
          <a [href]="'mailto:' + company().email" class="flex min-w-0 items-center gap-1.5 transition-colors hover:text-gold" [attr.aria-label]="company().email" [attr.tabindex]="scrolled() ? -1 : null">
            <nb-icon name="mail" class="h-3.5 w-3.5 text-gold" />
            <span class="truncate" [class]="contact.phones.length ? 'hidden lg:inline' : ''">{{ company().email }}</span>
          </a>
          <span class="hidden items-center gap-1.5 xl:flex"><nb-icon name="pin" class="h-3.5 w-3.5 text-gold" />{{ company().location }}</span>
        </div>
        @if (socials.length) {
          <div class="flex shrink-0 items-center gap-2">
            <span class="hidden text-[#8FA0B8] sm:inline">{{ 'topbar.follow' | translate }}</span>
            <ul class="-mr-1.5 flex items-center">
              @for (s of socials; track s.id) {
                <li>
                  @if (s.url) {
                    <a [href]="s.url" target="_blank" rel="noopener noreferrer" [attr.title]="s.label" [attr.tabindex]="scrolled() ? -1 : null"
                       [attr.aria-label]="'topbar.social' | translate: { name: s.label }"
                       class="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-gold">
                      <nb-social-icon [name]="s.id" class="h-3.5 w-3.5" />
                    </a>
                  } @else {
                    <span role="img" [attr.title]="s.label" [attr.aria-label]="s.label" class="flex h-7 w-7 items-center justify-center rounded-full">
                      <nb-social-icon [name]="s.id" class="h-3.5 w-3.5" />
                    </span>
                  }
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </div>
    <div class="container-nb flex h-20 items-center justify-between">
      <a routerLink="/" class="flex items-center" [attr.aria-label]="'nav.homeAria' | translate">
        <img [src]="solid() ? 'logos/logo-horizontal-couleur.svg' : 'logos/logo-horizontal-negatif-transparent.svg'"
             alt="NovaBridge Global Supply LLC" class="h-12 w-auto">
      </a>

      <nav class="hidden items-center gap-8 lg:flex" [attr.aria-label]="'nav.main' | translate">
        @for (l of links; track l.path) {
          <a [routerLink]="l.path" routerLinkActive="!text-gold" [routerLinkActiveOptions]="{ exact: l.path === '/' }"
             class="text-sm font-semibold transition-colors hover:text-gold"
             [class]="solid() ? 'text-navy' : 'text-white'">{{ l.label | translate }}</a>
        }
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Recherche dans tout le site (Ctrl/⌘ + K ou « / ») -->
        <button type="button" (click)="search.show()" [attr.aria-label]="'search.open' | translate" [attr.title]="('search.open' | translate) + ' (Ctrl + K)'"
                class="flex items-center gap-2 rounded-full p-2 transition-colors hover:text-gold 2xl:border 2xl:px-3.5"
                [class]="solid() ? 'text-navy 2xl:border-mist 2xl:hover:border-gold' : 'text-white 2xl:border-white/30 2xl:hover:border-gold'">
          <nb-icon name="search" class="h-5 w-5" />
          <span class="hidden text-sm 2xl:inline" [class]="solid() ? 'text-steel' : 'text-white/80'">{{ 'search.short' | translate }}</span>
          <kbd class="hidden rounded px-1.5 text-[10px] font-semibold 2xl:inline" [class]="solid() ? 'bg-cloud text-steel' : 'bg-white/10 text-white/80'">Ctrl K</kbd>
        </button>
        <nb-language-switcher class="hidden lg:block" [light]="!solid()" />
        <a routerLink="/quote" class="btn btn-gold hidden sm:inline-flex">{{ 'nav.quote' | translate }}</a>
        <button class="rounded p-2 lg:hidden" [class]="solid() ? 'text-navy' : 'text-white'"
                (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()" [attr.aria-label]="'nav.menu' | translate">
          <nb-icon [name]="menuOpen() ? 'close' : 'menu'" class="h-7 w-7" />
        </button>
      </div>
    </div>

    @if (menuOpen()) {
      <nav class="border-t border-mist bg-white lg:hidden" [attr.aria-label]="'nav.mobile' | translate">
        <div class="container-nb flex flex-col py-4">
          <button type="button" (click)="menuOpen.set(false); search.show()"
                  class="mb-2 flex items-center gap-3 rounded-xl border border-mist bg-cloud px-4 py-3 text-left text-sm text-steel">
            <nb-icon name="search" class="h-5 w-5 text-navy" />{{ 'search.placeholder' | translate }}
          </button>
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" (click)="menuOpen.set(false)" class="border-b border-mist py-3 font-semibold text-navy">{{ l.label | translate }}</a>
          }
          <nb-language-switcher variant="inline" class="mt-4 block" />
          <a routerLink="/quote" (click)="menuOpen.set(false)" class="btn btn-gold mt-4 justify-center">{{ 'nav.quote' | translate }}</a>
        </div>
      </nav>
    }
  </header>

  <!-- Hauteur de l'en-tête : barre du haut (36 px) + menu (80 px) -->
  <main [style.padding-top.px]="isHome() ? 0 : 116">
    <router-outlet />
  </main>

  <!-- ===== Appel à l'action ===== -->
  <section class="bg-ivory">
    <div class="container-nb pb-24 pt-16 md:pb-32">
      <div class="relative overflow-hidden rounded-2xl bg-navy px-8 py-12 md:px-14">
        <svg class="pointer-events-none absolute -right-10 bottom-0 h-full opacity-60" viewBox="0 0 400 220" aria-hidden="true">
          <g fill="none" stroke="#C9A24B"><path d="M40 230A170 170 0 0 1 380 230" stroke-width="1.6"/><path d="M90 230A120 120 0 0 1 330 230" opacity=".45"/><path d="M140 230A70 70 0 0 1 280 230" opacity=".25"/></g>
        </svg>
        <div class="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p class="overline !text-gold">{{ 'cta.kicker' | translate }}</p>
            <h2 class="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">{{ 'cta.title' | translate }} <span class="text-gold">{{ 'cta.titleHighlight' | translate }}</span></h2>
          </div>
          <a routerLink="/quote" class="btn btn-gold text-base">{{ 'common.requestQuote' | translate }} <nb-icon name="arrow" class="h-5 w-5" /></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Pied de page ===== -->
  <footer class="relative bg-navy text-[#C9D3E0]">
    <!-- Vague unique (statique) qui forme le haut du pied de page, même couleur que le fond -->
    <svg class="pointer-events-none absolute inset-x-0 bottom-full block h-14 w-full translate-y-px text-navy md:h-20"
         viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 72C180 22 360 4 560 34s380 82 600 70c120-6 210-34 280-60V120H0Z"/>
    </svg>
    <div class="container-nb grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
      <div class="lg:col-span-1">
        <img src="logos/logo-horizontal-negatif-transparent.svg" alt="NovaBridge Global Supply LLC" class="h-14 w-auto">
        <p class="mt-5 text-sm leading-relaxed">{{ 'footer.about' | translate: { tagline: company().tagline } }}</p>
        <p class="mt-4 font-display text-sm font-semibold text-gold">{{ company().slogan }}</p>
        @if (socials.length) {
          <ul class="mt-6 flex flex-wrap gap-2">
            @for (s of socials; track s.id) {
              <li>
                @if (s.url) {
                  <a [href]="s.url" target="_blank" rel="noopener noreferrer" [attr.title]="s.label" [attr.aria-label]="'topbar.social' | translate: { name: s.label }"
                     class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-gold hover:bg-gold hover:text-navy">
                    <nb-social-icon [name]="s.id" class="h-4 w-4" /></a>
                } @else {
                  <span role="img" [attr.title]="s.label" [attr.aria-label]="s.label"
                        class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white">
                    <nb-social-icon [name]="s.id" class="h-4 w-4" /></span>
                }
              </li>
            }
          </ul>
        }
      </div>
      <div>
        <h3 class="footer-title">{{ 'footer.products' | translate }}</h3>
        <ul class="space-y-2 text-sm">
          @for (p of products(); track p.slug) {
            <li><a [routerLink]="['/products', p.slug]" class="hover:text-gold">{{ p.name }}</a></li>
          }
        </ul>
      </div>
      <div>
        <h3 class="footer-title">{{ 'footer.company' | translate }}</h3>
        <ul class="space-y-2 text-sm">
          <li><a routerLink="/about" class="hover:text-gold">{{ 'footer.aboutUs' | translate }}</a></li>
          <li><a routerLink="/how-it-works" class="hover:text-gold">{{ 'nav.howItWorks' | translate }}</a></li>
          <li><a routerLink="/markets" class="hover:text-gold">{{ 'nav.markets' | translate }}</a></li>
          <li><a routerLink="/news" class="hover:text-gold">{{ 'nav.news' | translate }}</a></li>
          <li><a routerLink="/faq" class="hover:text-gold">{{ 'faq.kicker' | translate }}</a></li>
          <li><a routerLink="/contact" class="hover:text-gold">{{ 'nav.contact' | translate }}</a></li>
        </ul>
      </div>
      <div>
        <h3 class="footer-title">{{ 'nav.contact' | translate }}</h3>
        <ul class="space-y-3 text-sm">
          @for (p of contact.phones; track p) { <li class="flex gap-3"><nb-social-icon name="phone" class="h-5 w-5 text-white" /><a [href]="tel(p)" class="hover:text-gold">{{ p }}</a></li> }
          @if (contact.whatsapp) { <li class="flex gap-3"><nb-social-icon name="whatsapp" class="h-5 w-5 text-white" /><a [href]="'https://wa.me/' + contact.whatsapp" target="_blank" rel="noopener noreferrer" class="hover:text-gold">WhatsApp</a></li> }
          @for (e of emails(); track e) { <li class="flex gap-3"><nb-icon name="mail" class="h-5 w-5 shrink-0 text-white" /><a [href]="'mailto:' + e" class="break-all hover:text-gold">{{ e }}</a></li> }
          <li class="flex gap-3"><nb-icon name="globe" class="h-5 w-5 text-white" /><a [href]="company().websiteUrl" target="_blank" rel="noopener" class="hover:text-gold">{{ company().website }}</a></li>
          <li class="flex gap-3"><nb-icon name="pin" class="h-5 w-5 text-white" />{{ company().location }}</li>
          <li class="flex gap-3"><nb-icon name="chat" class="h-5 w-5 text-white" />{{ company().languages.join(' · ') }}</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-nb flex flex-col items-center justify-between gap-3 py-6 text-xs text-[#8FA0B8] md:flex-row">
        <div class="flex flex-col items-center gap-1 md:items-start">
          <span>© {{ year }} {{ company().name }}. {{ 'footer.rights' | translate }}</span>
          <a href="https://www.ayemtech.com" target="_blank" rel="noopener" class="transition-colors hover:text-gold">{{ 'footer.developedBy' | translate: { name: 'AyemTech' } }}</a>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a routerLink="/cookies" class="hover:text-gold">{{ 'footer.cookiePolicy' | translate }}</a>
          <button type="button" class="hover:text-gold" (click)="consent.openSettings()">{{ 'footer.cookieSettings' | translate }}</button>
          <a routerLink="/admin" class="hover:text-gold">{{ 'footer.admin' | translate }}</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- ===== Retour en haut & cookies ===== -->
  <nb-back-to-top />
  <nb-chat-widget />
  <nb-site-search />
  <nb-cookie-banner />
  <nb-cookie-settings />
  `,
})
export class PublicLayoutComponent {
  private lang = inject(LanguageService);
  readonly contact = CONTACT;
  readonly tel = telHref;
  /** Tous les réseaux sont affichés ; l'icône n'est cliquable que si son URL est renseignée. */
  readonly socials = SOCIALS;
  readonly company = computed(() => this.lang.obj('data.company', COMPANY));
  readonly emails = computed(() => [this.company().email, ...CONTACT.emails]);
  readonly store = inject(StoreService);
  readonly consent = inject(CookieConsentService);
  readonly search = inject(SiteSearchService);
  readonly products = computed(() => this.store.visibleProducts().map(p => this.lang.product(p)));
  readonly year = new Date().getFullYear();
  readonly links = [
    { path: '/', label: 'nav.home' },
    { path: '/products', label: 'nav.products' },
    { path: '/markets', label: 'nav.markets' },
    { path: '/how-it-works', label: 'nav.howItWorks' },
    { path: '/about', label: 'nav.about' },
    { path: '/news', label: 'nav.news' },
    { path: '/contact', label: 'nav.contact' },
  ];

  private router = inject(Router);
  private url = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)), { initialValue: this.router.url });
  readonly isHome = computed(() => this.url().split(/[?#]/)[0] === '/');
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly solid = computed(() => !this.isHome() || this.scrolled() || this.menuOpen());

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 40); }
}
