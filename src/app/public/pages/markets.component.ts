import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { LOGISTICS, MARKETS, img } from '../../core/data/company';

@Component({
  selector: 'nb-markets',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'home.markets.kicker' | translate" [title]="'markets.hero.title' | translate"
    [subtitle]="'markets.hero.subtitle' | translate"
    image="photo-1494412574643-ff11b0a5c1c3" />

  <section class="section">
    <div class="container-nb grid gap-8 md:grid-cols-2">
      @for (m of markets(); track m.id) {
        <article class="group overflow-hidden rounded-2xl border border-mist bg-white shadow-nb-sm" nbReveal>
          <div class="relative h-64 overflow-hidden">
            <img [src]="img(m.image, 1000, 600)" [alt]="m.name" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent"></div>
            <div class="absolute bottom-5 left-6 flex items-center gap-3">
              <span class="text-3xl" aria-hidden="true">{{ m.flag }}</span>
              <h2 class="font-display text-3xl font-extrabold text-white">{{ m.name }}</h2>
              @if (m.badge) { <span class="badge">{{ m.badge }}</span> }
            </div>
          </div>
          <div class="grid gap-6 p-7 sm:grid-cols-2">
            <div>
              <h3 class="overline">{{ 'markets.locations' | translate }}</h3>
              <ul class="mt-3 space-y-2">@for (c of m.cities; track c) { <li class="flex gap-2 font-semibold text-navy"><nb-icon name="pin" class="h-5 w-5" />{{ c }}</li> }</ul>
            </div>
            <div>
              <h3 class="overline">{{ 'markets.sectors' | translate }}</h3>
              <div class="mt-3 flex flex-wrap gap-2">@for (s of m.sectors; track s) { <span class="badge !bg-cloud">{{ s }}</span> }</div>
            </div>
          </div>
        </article>
      }
    </div>
  </section>

  <section class="section bg-ivory">
    <div class="container-nb grid items-center gap-12 lg:grid-cols-2">
      <div nbReveal="left">
        <p class="overline">{{ 'markets.logistics.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ 'markets.logistics.title' | translate }}</h2>
        <p class="mt-5 text-lg">{{ 'markets.logistics.text' | translate }}</p>
        <ul class="mt-8 space-y-5">
          @for (l of logistics(); track $index; let i = $index) {
            <li class="flex gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-white"><nb-icon [name]="['ship', 'plane', 'brand'][i]" class="h-6 w-6" /></div>
              <div><h3 class="font-display font-bold text-navy">{{ l.title }}</h3><p class="text-sm text-steel">{{ l.text }}</p></div>
            </li>
          }
        </ul>
        <a routerLink="/quote" class="btn btn-primary mt-10">{{ 'markets.logistics.cta' | translate }}</a>
      </div>
      <img nbReveal="right" [src]="img('photo-1565793298595-6a879b1d9492', 1100, 800)" [alt]="'markets.logistics.imageAlt' | translate" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-nb-lg" loading="lazy">
    </div>
  </section>
  `,
})
export class MarketsComponent {
  private lang = inject(LanguageService);
  readonly markets = computed(() => this.lang.list('data.markets', MARKETS));
  readonly logistics = computed(() => this.lang.list('data.logistics', LOGISTICS));
  readonly img = img;
}
