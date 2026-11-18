import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { FormBuilder, Validators } from '@angular/forms';
import { COMPANY, STEPS } from '../../core/data/company';
import { QuoteRequest } from '../../core/models';
import { StoreService } from '../../core/services/store.service';

export const COUNTRIES = ['USA', 'Canada', 'Italy', 'France', 'Belgium', 'Western Europe (other)', 'DRC Congo', 'South Africa', 'Africa (other)', 'Other'];

@Component({
  selector: 'nb-quote',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'quote.hero.kicker' | translate" [title]="'quote.hero.title' | translate"
    [subtitle]="'quote.hero.subtitle' | translate" image="photo-1494961104209-3c223057bd26" />

  <section class="section">
    <div class="container-nb grid gap-12 lg:grid-cols-3">
      <div class="lg:col-span-2">
        @if (sent(); as q) {
          <div class="rounded-2xl border-t-[3px] border-gold bg-ivory p-10 text-center" nbReveal="scale">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white"><nb-icon name="check" class="h-8 w-8" /></div>
            <h2 class="h3 mt-6">{{ 'quote.sent.title' | translate: { name: q.name } }}</h2>
            <p class="mt-3 text-lg">{{ 'quote.sent.p1' | translate }} <strong class="text-navy">{{ q.id }}</strong> {{ 'quote.sent.p2' | translate }} <strong class="text-navy">{{ q.email }}</strong>{{ 'quote.sent.p3' | translate }}</p>
            <div class="mt-8 flex flex-wrap justify-center gap-4">
              <button class="btn btn-outline" (click)="reset()">{{ 'quote.sent.again' | translate }}</button>
              <a routerLink="/" class="btn btn-primary">{{ 'common.backHome' | translate }}</a>
            </div>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="card-nb !p-8 md:!p-10" novalidate>
            <h2 class="h3">{{ 'quote.form.title' | translate }}</h2>
            <p class="mt-1 text-sm text-steel">{{ 'quote.form.required' | translate }}</p>

            <fieldset class="mt-8 grid gap-5 md:grid-cols-2">
              <legend class="overline mb-4">{{ 'quote.form.companySection' | translate }}</legend>
              <label class="field"><span>{{ 'form.fullName' | translate }} *</span><input class="input" formControlName="name" autocomplete="name"></label>
              <label class="field"><span>{{ 'quote.form.company' | translate }} *</span><input class="input" formControlName="company" autocomplete="organization"></label>
              <label class="field"><span>{{ 'quote.form.email' | translate }} *</span><input class="input" type="email" formControlName="email" autocomplete="email" [placeholder]="'quote.form.emailPlaceholder' | translate"></label>
              <label class="field"><span>{{ 'quote.form.phone' | translate }}</span><input class="input" type="tel" formControlName="phone" autocomplete="tel"></label>
              <label class="field md:col-span-2"><span>{{ 'quote.form.country' | translate }} *</span>
                <select class="input" formControlName="country">@for (c of countries; track c; let i = $index) { <option [value]="c">{{ countryLabels()[i] }}</option> }</select>
              </label>
            </fieldset>

            <fieldset class="mt-10 grid gap-5 md:grid-cols-2">
              <legend class="overline mb-4">{{ 'quote.form.productsSection' | translate }}</legend>
              <label class="field"><span>{{ 'quote.form.productLine' | translate }} *</span>
                <select class="input" formControlName="productLine">@for (p of products(); track p.slug) { <option [value]="p.rawName">{{ p.name }}</option> }<option value="Other">{{ 'quote.form.otherLine' | translate }}</option></select>
              </label>
              <label class="field"><span>{{ 'quote.form.quantity' | translate }} *</span><input class="input" type="number" min="1" formControlName="quantity"></label>
              <label class="field md:col-span-2"><span>{{ 'quote.form.product' | translate }} *</span><input class="input" formControlName="product" [placeholder]="'quote.form.productPlaceholder' | translate"></label>
              <div class="field"><span>{{ 'quote.form.delivery' | translate }}</span>
                <div class="mt-1 flex gap-3">
                  <label class="choice"><input type="radio" value="standard" formControlName="delivery"> {{ 'quote.form.standard' | translate }}</label>
                  <label class="choice"><input type="radio" value="express" formControlName="delivery"> {{ 'quote.form.express' | translate }}</label>
                </div>
              </div>
              <label class="choice self-end"><input type="checkbox" formControlName="branding"> {{ 'quote.form.branding' | translate }}</label>
              <label class="field md:col-span-2"><span>{{ 'form.message' | translate }}</span><textarea class="input min-h-[120px]" formControlName="message" [placeholder]="'quote.form.messagePlaceholder' | translate"></textarea></label>
            </fieldset>

            @if (error()) { <p class="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-danger" role="alert">{{ 'quote.form.error' | translate }}</p> }
            <button type="submit" class="btn btn-gold mt-8 w-full justify-center text-base md:w-auto">{{ 'quote.form.submit' | translate }} <nb-icon name="arrow" class="h-5 w-5" /></button>
          </form>
        }
      </div>

      <aside class="space-y-6" nbReveal="right">
        <div class="rounded-2xl bg-navy p-8 text-[#C9D3E0]">
          <h3 class="font-display text-xl font-bold text-white">{{ 'quote.next' | translate }}</h3>
          <ol class="mt-6 space-y-5">
            @for (s of steps(); track s.n) {
              <li class="flex gap-4"><span class="font-display text-lg font-extrabold text-gold">{{ s.n }}</span><div><div class="font-semibold text-white">{{ s.title }}</div><div class="text-sm">{{ s.text }}</div></div></li>
            }
          </ol>
        </div>
        <div class="card-nb">
          <h3 class="font-display text-lg font-bold text-navy">{{ 'quote.preferEmail' | translate }}</h3>
          <a [href]="'mailto:' + company().email" class="mt-3 flex items-center gap-3 font-semibold text-atlantic"><nb-icon name="mail" class="h-5 w-5" />{{ company().email }}</a>
          <p class="mt-3 text-sm text-steel">{{ 'quote.teamSpeaks' | translate: { languages: company().languages.join(', ') } }}</p>
        </div>
      </aside>
    </div>
  </section>
  `,
})
export class QuoteComponent implements OnInit {
  readonly line = input<string>('');
  readonly store = inject(StoreService);
  private fb = inject(FormBuilder);
  private lang = inject(LanguageService);
  readonly company = computed(() => this.lang.obj('data.company', COMPANY));
  readonly steps = computed(() => this.lang.list('data.steps', STEPS));
  readonly products = computed(() => this.store.visibleProducts().map(p => this.lang.product(p)));
  /** Les valeurs envoyées restent en anglais (back-office) ; seuls les libellés sont traduits. */
  readonly countries = COUNTRIES;
  readonly countryLabels = computed(() => this.lang.t<string[]>('quote.countries', COUNTRIES));
  readonly sent = signal<QuoteRequest | null>(null);
  readonly error = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    country: ['USA', Validators.required],
    productLine: ['PPE & Safety', Validators.required],
    product: ['', Validators.required],
    quantity: [100, [Validators.required, Validators.min(1)]],
    delivery: ['standard' as 'standard' | 'express'],
    branding: [false],
    message: [''],
  });

  ngOnInit() { if (this.line()) this.form.patchValue({ productLine: this.line() }); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set(true); return; }
    this.error.set(false);
    this.sent.set(this.store.addQuote(this.form.getRawValue()));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  reset() { this.form.reset(); this.sent.set(null); }
}
