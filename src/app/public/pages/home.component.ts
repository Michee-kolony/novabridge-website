import { AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { gsap } from 'gsap';
import { ADVANTAGES, COMPANY, IMAGES, MARKETS, SOURCING_NETWORK, STATS, STEPS, img } from '../../core/data/company';
import { StoreService } from '../../core/services/store.service';
import { prefersReducedMotion } from '../../shared/gsap.directives';

@Component({
  selector: 'nb-home',
  standalone: false,
  template: `
  <!-- ===== HERO ===== -->
  <section #hero class="relative flex min-h-[100svh] items-center overflow-hidden bg-navy">
    <div class="absolute inset-0 -top-[10%] h-[120%]" [nbParallax]="14">
      <img [src]="img(images.hero, 1600)" alt="" class="h-full w-full object-cover">
    </div>
    <div class="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40"></div>

    <svg class="hero-arcs pointer-events-none absolute hidden md:block -bottom-2 -right-32 h-[70%] w-auto max-w-none opacity-70 xl:-right-10" viewBox="0 0 600 400" aria-hidden="true">
      <g fill="none" stroke="#C9A24B">
        <path class="arc" d="M40 410A260 260 0 0 1 560 410" stroke-width="2"/>
        <path class="arc" d="M100 410A200 200 0 0 1 500 410" opacity=".5"/>
        <path class="arc" d="M160 410A140 140 0 0 1 440 410" opacity=".3"/>
        <path class="arc" d="M220 410A80 80 0 0 1 380 410" opacity=".18"/>
      </g>
      <path class="hero-star" d="M300 92l8 26 26 8-26 8-8 26-8-26-26-8 26-8z" fill="#C9A24B"/>
    </svg>

    <div class="container-nb relative z-10 py-32">
      <p class="hero-kicker overline !text-gold">{{ 'home.hero.kicker' | translate }}</p>
      <h1 class="mt-5 max-w-4xl hyphens-auto font-display text-[clamp(1.75rem,8.2vw,2.25rem)] font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-7xl">
        <!-- Texte complet pour les lecteurs d'écran ; la version animée est masquée pour eux -->
        <span class="sr-only">{{ line1().join('') }} {{ line2().join('') }}</span>
        <!-- Effet machine à écrire (GSAP) : la partie non encore tapée reste invisible pour éviter tout saut de mise en page -->
        <span class="block" aria-hidden="true">{{ line1().slice(0, typed1()).join('') }}@if (cursor() === 1) {<span class="tw-cursor" [class.tw-idle]="!typing()"></span>}<span class="invisible">{{ line1().slice(typed1()).join('') }}</span></span>
        <span class="block font-light text-gold" aria-hidden="true">{{ line2().slice(0, typed2()).join('') }}@if (cursor() === 2) {<span class="tw-cursor" [class.tw-idle]="!typing()"></span>}<span class="invisible">{{ line2().slice(typed2()).join('') }}</span></span>
      </h1>
      <p class="hero-text mt-7 max-w-2xl text-lg leading-relaxed text-[#C9D3E0]">
        {{ 'home.hero.text' | translate }}
      </p>
      <div class="hero-cta mt-10 flex flex-wrap gap-4">
        <a routerLink="/quote" class="btn btn-gold text-base">{{ 'home.hero.cta' | translate }} <nb-icon name="arrow" class="h-5 w-5" /></a>
        <a routerLink="/products" class="btn btn-ghost-light text-base">{{ 'home.hero.ctaSecondary' | translate }}</a>
      </div>
      <ul class="hero-cta mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-white/85">
        @for (p of company().promise; track p) {
          <li class="flex items-center gap-2"><nb-icon name="check" class="h-5 w-5" />{{ p }}</li>
        }
      </ul>
    </div>
  </section>

  <!-- ===== CHIFFRES CLÉS ===== -->
  <section class="relative z-10 -mt-16">
    <div class="container-nb">
      <div class="grid grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-nb-lg lg:grid-cols-4" nbReveal="stagger">
        @for (s of stats(); track s.key) {
          <div class="border-b border-r border-mist p-7 last:border-r-0 lg:border-b-0">
            <div class="font-display text-4xl font-extrabold text-navy lg:text-5xl">
              @if (s.value !== null) {<span [nbCountUp]="s.value"></span>} @else {<span>{{ s.display }}</span>}<span class="text-gold">{{ s.suffix }}</span>
            </div>
            <div class="mt-2 text-sm font-medium text-steel">{{ s.label }}</div>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ===== QUI SOMMES-NOUS ===== -->
  <section class="section">
    <div class="container-nb grid items-center gap-14 lg:grid-cols-2">
      <div nbReveal="left">
        <p class="overline">{{ 'home.who.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ 'home.who.title' | translate }}</h2>
        <div class="gold-rule my-6"></div>
        <p class="text-lg leading-relaxed">{{ company().intro }}</p>
        <p class="mt-4 font-semibold text-navy">{{ company().promise.join(' ') }}</p>
        <a routerLink="/about" class="link-arrow mt-8">{{ 'home.who.link' | translate }} <nb-icon name="arrow" class="h-4 w-4" /></a>
      </div>
      <div class="relative" nbReveal="right">
        <img [src]="img(images.warehouse, 1100, 800)" [alt]="'home.who.imageAlt' | translate" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-nb-lg" loading="lazy">
        <div class="absolute -bottom-8 -left-6 hidden rounded-xl bg-navy p-6 text-white shadow-nb-lg sm:block">
          <img src="logos/sceau-qualite-bleu-nuit.svg" alt="" class="mb-3 h-16 w-16">
          <div class="font-display text-lg font-bold">{{ 'home.who.qcTitle' | translate }}</div>
          <div class="text-sm text-[#C9D3E0]">{{ 'home.who.qcText' | translate }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== GAMMES DE PRODUITS ===== -->
  <section class="section bg-ivory">
    <div class="container-nb">
      <div class="mx-auto max-w-2xl text-center" nbReveal>
        <p class="overline">{{ 'home.products.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ 'home.products.title' | translate }}</h2>
      </div>
      <div class="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4" nbReveal="stagger">
        @for (p of products(); track p.slug) {
          <a [routerLink]="['/products', p.slug]" class="group overflow-hidden rounded-xl border-t-[3px] border-gold bg-white shadow-nb-sm transition duration-300 hover:-translate-y-1 hover:shadow-nb-lg">
            <div class="h-48 overflow-hidden"><img [src]="img(p.image, 700, 500)" [alt]="p.name" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"></div>
            <div class="p-6">
              <div class="relative z-10 -mt-12 mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white shadow-nb"><nb-icon [name]="p.icon" class="h-6 w-6" /></div>
              <h3 class="font-display text-xl font-bold text-navy">{{ p.name }}</h3>
              <p class="mt-2 text-sm text-steel">{{ p.short }}</p>
              <p class="mt-4 text-xs font-semibold text-gold-deep">{{ p.industries.join(' · ') }}</p>
            </div>
          </a>
        }
      </div>
    </div>
  </section>

  <!-- ===== COMMENT ÇA MARCHE ===== -->
  <section class="section">
    <div class="container-nb">
      <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end" nbReveal>
        <div><p class="overline">{{ 'home.how.kicker' | translate }}</p><h2 class="h2 mt-3">{{ 'home.how.title' | translate }}</h2></div>
        <a routerLink="/how-it-works" class="link-arrow">{{ 'home.how.link' | translate }} <nb-icon name="arrow" class="h-4 w-4" /></a>
      </div>
      <ol class="mt-14 grid gap-8 md:grid-cols-5" nbReveal="stagger">
        @for (s of steps(); track s.n) {
          <li class="border-t-[3px] border-gold pt-5">
            <div class="font-display text-4xl font-extrabold text-navy">{{ s.n }}</div>
            <h3 class="mt-3 font-display text-lg font-bold text-navy">{{ s.title }}</h3>
            <p class="mt-2 text-sm text-steel">{{ s.text }}</p>
          </li>
        }
      </ol>
    </div>
  </section>

  <!-- ===== AVANTAGES ===== -->
  <section class="section relative overflow-hidden bg-navy text-[#C9D3E0]">
    <div class="absolute inset-0 opacity-15"><img [src]="img(images.containers, 1800)" alt="" class="h-full w-full object-cover" loading="lazy"></div>
    <div class="container-nb relative">
      <div class="max-w-2xl" nbReveal>
        <p class="overline !text-gold">{{ 'home.why.kicker' | translate }}</p>
        <h2 class="h2 mt-3 !text-white">{{ 'home.why.title' | translate }}</h2>
      </div>
      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" nbReveal="stagger">
        @for (a of advantages(); track a.icon) {
          <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-gold/60 hover:bg-white/10">
            <nb-icon [name]="a.icon" class="h-9 w-9 text-white" />
            <h3 class="mt-4 font-display text-lg font-bold text-white">{{ a.title }}</h3>
            <p class="mt-2 text-sm">{{ a.text }}</p>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ===== MARCHÉS ===== -->
  <section class="section">
    <div class="container-nb">
      <div class="mx-auto max-w-2xl text-center" nbReveal>
        <p class="overline">{{ 'home.markets.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ 'home.markets.title' | translate }}</h2>
      </div>
      <div class="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4" nbReveal="stagger">
        @for (m of markets(); track m.id) {
          <div class="group relative h-80 overflow-hidden rounded-xl">
            <img [src]="img(m.image, 700, 900)" [alt]="m.name" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent"></div>
            <div class="absolute inset-x-0 bottom-0 p-6 text-white">
              @if (m.badge) { <span class="badge mb-3">{{ m.badge }}</span> }
              <h3 class="font-display text-2xl font-extrabold">{{ m.name }}</h3>
              <p class="mt-1 text-sm text-gold">{{ m.cities.join(' · ') }}</p>
              <p class="mt-3 text-sm text-[#C9D3E0]">{{ m.sectors.join(' · ') }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ===== RÉSEAU DE SOURCING ===== -->
  <section class="section bg-ivory">
    <div class="container-nb grid items-center gap-14 lg:grid-cols-2">
      <div class="order-2 lg:order-1" nbReveal="left">
        <img [src]="img(images.ship, 1100, 800)" [alt]="'home.network.imageAlt' | translate" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-nb-lg" loading="lazy">
      </div>
      <div class="order-1 lg:order-2" nbReveal="right">
        <p class="overline">{{ 'home.network.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ 'home.network.title' | translate }}</h2>
        <ul class="mt-8 divide-y divide-mist border-y border-mist">
          @for (s of network(); track $index) {
            <li class="flex items-center justify-between gap-4 py-4">
              <span class="flex items-center gap-3 font-display font-bold text-navy"><nb-icon name="pin" class="h-5 w-5" />{{ s.place }}</span>
              <span class="text-right text-sm text-steel">{{ s.detail }}</span>
            </li>
          }
        </ul>
      </div>
    </div>
  </section>

  <!-- ===== ACTUALITÉS ===== -->
  @if (news().length) {
    <section class="section">
      <div class="container-nb">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end" nbReveal>
          <div><p class="overline">{{ 'home.news.kicker' | translate }}</p><h2 class="h2 mt-3">{{ 'home.news.title' | translate }}</h2></div>
          <a routerLink="/news" class="link-arrow">{{ 'home.news.link' | translate }} <nb-icon name="arrow" class="h-4 w-4" /></a>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3" nbReveal="stagger">
          @for (a of news().slice(0, 3); track a.id) {
            <a [routerLink]="['/news', a.id]" class="group overflow-hidden rounded-xl border border-mist bg-white transition hover:shadow-nb-lg">
              <div class="h-48 overflow-hidden"><img [src]="img(a.image, 700, 450)" [alt]="a.title" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"></div>
              <div class="p-6">
                <div class="flex items-center gap-3 text-xs"><span class="badge">{{ 'news.categories.' + a.category | translate }}</span><span class="text-steel">{{ a.date | date: 'mediumDate' : undefined : lang.locale() }}</span></div>
                <h3 class="mt-3 font-display text-lg font-bold text-navy group-hover:text-atlantic">{{ a.title }}</h3>
                <p class="mt-2 line-clamp-2 text-sm text-steel">{{ a.excerpt }}</p>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  }
  `,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly store = inject(StoreService);
  readonly lang = inject(LanguageService);
  readonly company = computed(() => this.lang.obj('data.company', COMPANY));
  readonly stats = computed(() => this.lang.list('data.stats', STATS));
  readonly steps = computed(() => this.lang.list('data.steps', STEPS));
  readonly advantages = computed(() => this.lang.list('data.advantages', ADVANTAGES));
  readonly markets = computed(() => this.lang.list('data.markets', MARKETS));
  readonly network = computed(() => this.lang.list('data.network', SOURCING_NETWORK));
  readonly products = computed(() => this.store.visibleProducts().map(p => this.lang.product(p)));
  readonly news = computed(() => this.store.publishedAnnouncements().map(a => this.lang.announcement(a)));
  readonly images = IMAGES;
  readonly img = img;

  // ----- Titre « machine à écrire » -----
  /** Caractères de chaque ligne (Array.from gère correctement le chinois et les accents). */
  readonly line1 = computed(() => Array.from(this.lang.t('home.hero.line1')));
  readonly line2 = computed(() => Array.from(this.lang.t('home.hero.line2')));
  /** Nombre de caractères déjà « tapés » sur chaque ligne. */
  readonly typed1 = signal(prefersReducedMotion() ? Infinity : 0);
  readonly typed2 = signal(prefersReducedMotion() ? Infinity : 0);
  /** Ligne où clignote le curseur (0 = pas de curseur). */
  readonly cursor = signal<0 | 1 | 2>(prefersReducedMotion() ? 0 : 1);
  /** Pendant la frappe le curseur reste plein ; il clignote seulement à l'arrêt. */
  readonly typing = signal(false);
  private typeTl?: gsap.core.Timeline;
  private viewReady = false;

  private hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private ctx?: gsap.Context;

  constructor() {
    // Changement de langue : on retape le titre dans la nouvelle langue.
    effect(() => {
      this.lang.current();
      untracked(() => { if (this.viewReady && !prefersReducedMotion()) this.typewriter().play(); });
    });
  }

  /** Timeline GSAP qui tape la ligne 1, marque une pause, puis tape la ligne 2. */
  private typewriter(): gsap.core.Timeline {
    this.typeTl?.kill();
    const l1 = { n: 0 };
    const l2 = { n: 0 };
    const len1 = this.line1().length;
    const len2 = this.line2().length;
    const speed = 0.055; // secondes par caractère
    this.typed1.set(0);
    this.typed2.set(0);
    this.cursor.set(1);
    this.typeTl = gsap.timeline({ paused: true, onComplete: () => this.typing.set(false) })
      .call(() => this.typing.set(true))
      .to(l1, { n: len1, duration: len1 * speed, ease: 'none', onUpdate: () => this.typed1.set(Math.round(l1.n)) })
      .call(() => { this.typing.set(false); this.cursor.set(2); }, [], '+=0.02')
      .call(() => this.typing.set(true), [], '+=0.35')
      .to(l2, { n: len2, duration: len2 * speed, ease: 'none', onUpdate: () => this.typed2.set(Math.round(l2.n)) });
    return this.typeTl;
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (prefersReducedMotion()) return;
    this.ctx = gsap.context(() => {
      const arcs = gsap.utils.toArray<SVGPathElement>('.arc');
      arcs.forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-kicker', { y: 20, opacity: 0, duration: 0.6 })
        .add(this.typewriter().play(), '-=0.2')
        .from('.hero-text', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .to(arcs, { strokeDashoffset: 0, duration: 1.8, stagger: 0.15, ease: 'power2.inOut' }, 0.2)
        .from('.hero-star', { scale: 0, rotate: -90, transformOrigin: '50% 50%', opacity: 0, duration: 0.9, ease: 'back.out(2)' }, 1.4);
      gsap.to('.hero-star', { rotate: 45, transformOrigin: '50% 50%', duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 });
    }, this.hero().nativeElement);
  }

  ngOnDestroy() { this.typeTl?.kill(); this.ctx?.revert(); }
}
