import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { LOGISTICS, img } from '../../core/data/company';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-products',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'home.products.kicker' | translate" [title]="'products.hero.title' | translate"
    [subtitle]="'products.hero.subtitle' | translate"
    image="photo-1586528116311-ad8dd3c8310d" />

  <section class="section">
    <div class="container-nb space-y-24">
      @for (p of products(); track p.slug; let i = $index) {
        <article class="grid items-center gap-12 lg:grid-cols-2">
          <div [class]="i % 2 === 1 ? 'lg:order-2' : ''" [nbReveal]="i % 2 ? 'right' : 'left'">
            <img [src]="img(p.image, 1100, 800)" [alt]="p.name" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-nb-lg" loading="lazy">
          </div>
          <div nbReveal>
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white"><nb-icon [name]="p.icon" class="h-6 w-6" /></div>
              <span class="overline">{{ 'products.hub' | translate }} · {{ p.hub }}</span>
            </div>
            <h2 class="h2 mt-5">{{ p.name }}</h2>
            <p class="mt-4 text-lg leading-relaxed">{{ p.description }}</p>
            <ul class="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              @for (it of p.items; track it) {
                <li class="flex items-start gap-2 text-navy"><nb-icon name="check" class="mt-0.5 h-5 w-5" />{{ it }}</li>
              }
            </ul>
            <div class="mt-6 flex flex-wrap gap-2">
              @for (ind of p.industries; track ind) { <span class="badge">{{ ind }}</span> }
            </div>
            <div class="mt-8 flex flex-wrap gap-4">
              <a [routerLink]="['/products', p.slug]" class="btn btn-primary">{{ 'products.details' | translate }}</a>
              <a routerLink="/quote" [queryParams]="{ line: p.rawName }" class="btn btn-outline">{{ 'common.requestQuote' | translate }}</a>
            </div>
          </div>
        </article>
      }
    </div>
  </section>

  <section class="section bg-ivory">
    <div class="container-nb">
      <div class="max-w-2xl" nbReveal><p class="overline">{{ 'products.also.kicker' | translate }}</p><h2 class="h2 mt-3">{{ 'products.also.title' | translate }}</h2></div>
      <div class="mt-10 grid gap-6 md:grid-cols-3" nbReveal="stagger">
        @for (l of logistics(); track $index; let i = $index) {
          <div class="card-nb">
            <nb-icon [name]="['ship', 'plane', 'brand'][i]" class="h-9 w-9 text-navy" />
            <h3 class="mt-4 font-display text-lg font-bold text-navy">{{ l.title }}</h3>
            <p class="mt-2 text-sm text-steel">{{ l.text }}</p>
          </div>
        }
      </div>
    </div>
  </section>
  `,
})
export class ProductsComponent {
  readonly store = inject(StoreService);
  private lang = inject(LanguageService);
  readonly products = computed(() => this.store.visibleProducts().map(p => this.lang.product(p)));
  readonly logistics = computed(() => this.lang.list('data.logistics', LOGISTICS));
  readonly img = img;
}
