import { Component, computed, inject, input, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { img } from '../../core/data/company';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-news',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'home.news.title' | translate" [title]="'news.hero.title' | translate"
    [subtitle]="'news.hero.subtitle' | translate" image="photo-1605745341112-85968b19335b" />

  <section class="section">
    <div class="container-nb">
      <div class="mb-10 flex flex-wrap gap-2">
        @for (c of categories(); track c) {
          <button (click)="filter.set(c)" class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                  [class]="filter() === c ? 'border-navy bg-navy text-white' : 'border-mist text-navy hover:border-navy'">{{ 'news.categories.' + c | translate }}</button>
        }
      </div>

      @if (featured(); as f) {
        <a [routerLink]="['/news', f.id]" class="group mb-10 grid overflow-hidden rounded-2xl bg-navy lg:grid-cols-2" nbReveal>
          <div class="h-72 overflow-hidden lg:h-auto"><img [src]="img(f.image, 1100, 700)" [alt]="f.title" class="h-full w-full object-cover transition duration-700 group-hover:scale-105"></div>
          <div class="p-10">
            <span class="badge">{{ 'news.featured' | translate }} · {{ 'news.categories.' + f.category | translate }}</span>
            <h2 class="mt-4 font-display text-3xl font-extrabold text-white">{{ f.title }}</h2>
            <p class="mt-4 text-[#C9D3E0]">{{ f.excerpt }}</p>
            <p class="mt-6 text-sm text-gold">{{ f.date | date: 'longDate' : undefined : lang.locale() }} · {{ 'news.readMore' | translate }} →</p>
          </div>
        </a>
      }

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        @for (a of list(); track a.id) {
          <a [routerLink]="['/news', a.id]" class="group overflow-hidden rounded-xl border border-mist bg-white transition hover:shadow-nb-lg" nbReveal>
            <div class="h-52 overflow-hidden"><img [src]="img(a.image, 700, 450)" [alt]="a.title" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"></div>
            <div class="p-6">
              <div class="flex items-center gap-3 text-xs"><span class="badge">{{ 'news.categories.' + a.category | translate }}</span><span class="text-steel">{{ a.date | date: 'mediumDate' : undefined : lang.locale() }}</span></div>
              <h3 class="mt-3 font-display text-lg font-bold text-navy group-hover:text-atlantic">{{ a.title }}</h3>
              <p class="mt-2 text-sm text-steel">{{ a.excerpt }}</p>
            </div>
          </a>
        } @empty {
          <p class="text-steel">{{ 'news.empty' | translate }}</p>
        }
      </div>
    </div>
  </section>
  `,
})
export class NewsComponent {
  private store = inject(StoreService);
  readonly lang = inject(LanguageService);
  readonly img = img;
  readonly filter = signal('All');
  private published = computed(() => this.store.publishedAnnouncements().map(a => this.lang.announcement(a)));
  readonly categories = computed(() => ['All', ...new Set(this.published().map(a => a.category))]);
  private filtered = computed(() => this.published().filter(a => this.filter() === 'All' || a.category === this.filter()));
  readonly featured = computed(() => this.filtered().find(a => a.featured));
  readonly list = computed(() => this.filtered().filter(a => a !== this.featured()));
}

@Component({
  selector: 'nb-news-detail',
  standalone: false,
  template: `
  @if (item(); as a) {
    <article>
      <div class="relative h-[50vh] min-h-[360px] overflow-hidden bg-navy">
        <img [src]="img(a.image, 1800, 900)" [alt]="a.title" class="h-full w-full object-cover opacity-50">
        <div class="absolute inset-0 bg-gradient-to-t from-navy to-transparent"></div>
        <div class="container-nb absolute inset-x-0 bottom-0 pb-12">
          <span class="badge">{{ 'news.categories.' + a.category | translate }}</span>
          <h1 class="mt-4 max-w-3xl font-display text-4xl font-extrabold text-white md:text-5xl">{{ a.title }}</h1>
          <p class="mt-3 text-gold">{{ a.date | date: 'longDate' : undefined : lang.locale() }}</p>
        </div>
      </div>
      <div class="container-nb max-w-3xl py-16">
        <p class="text-xl font-medium leading-relaxed text-navy">{{ a.excerpt }}</p>
        <div class="gold-rule my-8"></div>
        @for (para of a.content.split('\\n'); track $index) { <p class="mb-5 text-lg leading-relaxed">{{ para }}</p> }
        <div class="mt-12 flex flex-wrap gap-4">
          <a routerLink="/news" class="btn btn-outline">← {{ 'home.news.link' | translate }}</a>
          <a routerLink="/quote" class="btn btn-primary">{{ 'common.requestQuote' | translate }} <nb-icon name="arrow" class="h-5 w-5" /></a>
        </div>
      </div>
    </article>
  } @else {
    <section class="section"><div class="container-nb text-center"><h1 class="h2">{{ 'news.notFound' | translate }}</h1><a routerLink="/news" class="btn btn-primary mt-8">{{ 'news.back' | translate }}</a></div></section>
  }
  `,
})
export class NewsDetailComponent {
  readonly id = input<string>('');
  private store = inject(StoreService);
  readonly lang = inject(LanguageService);
  readonly img = img;
  readonly item = computed(() => {
    const a = this.store.publishedAnnouncements().find(x => x.id === this.id());
    return a ? this.lang.announcement(a) : undefined;
  });
}
