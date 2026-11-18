import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { COMPANY, IMAGES, SOURCING_NETWORK, STATS, img } from '../../core/data/company';

@Component({
  selector: 'nb-about',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'about.hero.kicker' | translate" [title]="company().slogan"
    [subtitle]="'about.hero.subtitle' | translate"
    [image]="images.team" />

  <section class="section">
    <div class="container-nb grid gap-14 lg:grid-cols-2">
      <div nbReveal="left">
        <p class="overline">{{ 'home.who.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ company().name }}</h2>
        <div class="gold-rule my-6"></div>
        <p class="text-lg leading-relaxed">{{ company().intro }}</p>
        <p class="mt-5 text-lg font-semibold text-navy">{{ company().promise.join(' ') }}</p>
      </div>
      <div class="grid grid-cols-2 gap-5" nbReveal="stagger">
        @for (s of stats(); track s.key) {
          <div class="rounded-xl border-t-[3px] border-gold bg-ivory p-7">
            <div class="font-display text-4xl font-extrabold text-navy">
              @if (s.value !== null) {<span [nbCountUp]="s.value"></span>} @else {<span>{{ s.display }}</span>}<span class="text-gold">{{ s.suffix }}</span>
            </div>
            <div class="mt-2 text-sm text-steel">{{ s.label }}</div>
          </div>
        }
      </div>
    </div>
  </section>

  <section class="section bg-ivory">
    <div class="container-nb">
      <div class="mx-auto max-w-2xl text-center" nbReveal><p class="overline">{{ 'about.values.kicker' | translate }}</p><h2 class="h2 mt-3">{{ 'about.values.title' | translate }}</h2></div>
      <div class="mt-12 grid gap-6 md:grid-cols-2" nbReveal="stagger">
        <div class="rounded-2xl bg-navy p-8 text-[#C9D3E0]"><h3 class="font-display text-2xl font-bold text-white">{{ 'about.mission.title' | translate }}</h3><p class="mt-3">{{ 'about.mission.text' | translate }}</p></div>
        <div class="rounded-2xl bg-white p-8 shadow-nb-sm"><h3 class="font-display text-2xl font-bold text-navy">{{ 'about.vision.title' | translate }}</h3><p class="mt-3">{{ 'about.vision.text' | translate }}</p></div>
      </div>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" nbReveal="stagger">
        @for (v of values(); track v.i) {
          <div class="card-nb"><nb-icon [name]="v.i" class="h-8 w-8 text-navy" /><h3 class="mt-4 font-display text-lg font-bold text-navy">{{ v.t }}</h3><p class="mt-2 text-sm text-steel">{{ v.d }}</p></div>
        }
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container-nb grid items-center gap-14 lg:grid-cols-2">
      <img nbReveal="left" [src]="img(images.warehouse2, 1100, 800)" [alt]="'about.facilities.imageAlt' | translate" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-nb-lg" loading="lazy">
      <div nbReveal="right">
        <p class="overline">{{ 'about.facilities.kicker' | translate }}</p>
        <h2 class="h2 mt-3">{{ 'about.facilities.title' | translate }}</h2>
        <ul class="mt-8 space-y-4">
          @for (s of network(); track $index) {
            <li class="flex items-start gap-3"><nb-icon name="pin" class="mt-0.5 h-5 w-5 text-navy" /><div><span class="font-display font-bold text-navy">{{ s.place }}</span> — <span class="text-steel">{{ s.detail }}</span></div></li>
          }
        </ul>
        <div class="mt-8 flex items-center gap-3 rounded-xl bg-ivory p-5">
          <nb-icon name="chat" class="h-8 w-8 text-navy" />
          <p class="text-sm"><span class="font-bold text-navy">{{ 'about.facilities.team' | translate }}</span> {{ company().languages.join(', ') }}.</p>
        </div>
        <a routerLink="/contact" class="btn btn-primary mt-8">{{ 'about.facilities.cta' | translate }}</a>
      </div>
    </div>
  </section>
  `,
})
export class AboutComponent {
  private lang = inject(LanguageService);
  readonly company = computed(() => this.lang.obj('data.company', COMPANY));
  readonly stats = computed(() => this.lang.list('data.stats', STATS));
  readonly network = computed(() => this.lang.list('data.network', SOURCING_NETWORK));
  readonly images = IMAGES;
  readonly img = img;
  private readonly valuesEn = [
    { i: 'shield', t: 'Trust', d: 'Clear quotes, kept commitments, QC photos before every shipment.' },
    { i: 'file', t: 'Rigor', d: 'Precise processes, from order to DDP delivery.' },
    { i: 'clock', t: 'Reliability', d: 'Controlled lead times — 3 to 4 weeks on average.' },
    { i: 'star', t: 'Quality', d: 'Selected factories and systematic checks on every batch.' },
  ];
  readonly values = computed(() => this.lang.list('about.valuesList', this.valuesEn));
}
