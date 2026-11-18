import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { img } from '../../core/data/company';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-product-detail',
  standalone: false,
  template: `
  @if (product(); as p) {
    <nb-page-hero [kicker]="('productDetail.kicker' | translate) + ' · ' + p.hub" [title]="p.name" [subtitle]="p.description" [image]="p.image" />

    <section class="section">
      <div class="container-nb grid gap-14 lg:grid-cols-3">
        <div class="lg:col-span-2" nbReveal>
          <h2 class="h3">{{ 'productDetail.items' | translate }}</h2>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            @for (it of p.items; track it) {
              <div class="flex items-center gap-4 rounded-xl border border-mist bg-white p-5 transition hover:border-gold hover:shadow-nb">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ivory text-navy"><nb-icon [name]="p.icon" class="h-6 w-6" /></div>
                <span class="font-semibold text-navy">{{ it }}</span>
              </div>
            }
          </div>
          <div class="mt-10 grid gap-4 sm:grid-cols-2">
            @for (g of p.gallery; track g) {
              <img [src]="img(g, 800, 560)" [alt]="p.name" class="aspect-[10/7] w-full rounded-xl object-cover" loading="lazy">
            }
          </div>
        </div>
        <aside class="space-y-6" nbReveal="right">
          <div class="card-nb">
            <h3 class="font-display text-lg font-bold text-navy">{{ 'productDetail.industries' | translate }}</h3>
            <div class="mt-4 flex flex-wrap gap-2">@for (i of p.industries; track i) { <span class="badge">{{ i }}</span> }</div>
          </div>
          <div class="card-nb">
            <h3 class="font-display text-lg font-bold text-navy">{{ 'productDetail.included' | translate }}</h3>
            <ul class="mt-4 space-y-3 text-sm">
              @for (f of features(); track $index) { <li class="flex gap-2"><nb-icon name="check" class="h-5 w-5" />{{ f }}</li> }
            </ul>
          </div>
          <div class="rounded-xl bg-navy p-7 text-white">
            <h3 class="font-display text-xl font-bold">{{ 'productDetail.need' | translate: { name: p.name } }}</h3>
            <p class="mt-2 text-sm text-[#C9D3E0]">{{ 'productDetail.needText' | translate }}</p>
            <a routerLink="/quote" [queryParams]="{ line: p.rawName }" class="btn btn-gold mt-5 w-full justify-center">{{ 'common.requestQuote' | translate }}</a>
          </div>
        </aside>
      </div>
    </section>
  } @else {
    <section class="section"><div class="container-nb text-center">
      <h1 class="h2">{{ 'productDetail.notFound' | translate }}</h1>
      <a routerLink="/products" class="btn btn-primary mt-8">{{ 'productDetail.back' | translate }}</a>
    </div></section>
  }
  `,
})
export class ProductDetailComponent {
  readonly slug = input<string>('');
  private store = inject(StoreService);
  private lang = inject(LanguageService);
  readonly product = computed(() => { const p = this.store.product(this.slug()); return p?.visible ? this.lang.product(p) : undefined; });
  readonly img = img;
  private readonly featuresEn = ['Factory-direct pricing', 'Custom branding — your logo', 'Low MOQ from 50–100 units', 'QC photos before shipment', 'DDP delivery — customs & freight included'];
  readonly features = computed(() => this.lang.t<string[]>('productDetail.features', this.featuresEn));
}
