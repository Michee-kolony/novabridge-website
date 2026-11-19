import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { FormBuilder, Validators } from '@angular/forms';
import { COMPANY, CONTACT, MARKETS, SOCIALS, img, telHref } from '../../core/data/company';
import { StoreService } from '../../core/services/store.service';
import { MailService } from '../../core/services/mail.service';

@Component({
  selector: 'nb-contact',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'nav.contact' | translate" [title]="'contact.hero.title' | translate"
    [subtitle]="'contact.hero.subtitle' | translate" image="photo-1572021335469-31706a17aaef" />

  <section class="section">
    <div class="container-nb grid gap-12 lg:grid-cols-5">
      <div class="space-y-5 lg:col-span-2" nbReveal="left">
        @if (phones.length) {
          <div class="card-nb flex items-center gap-5">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-white"><nb-social-icon name="phone" class="h-6 w-6" /></div>
            <div class="min-w-0"><div class="overline">{{ 'contact.phone' | translate }}</div>
              @for (p of phones; track p) { <a [href]="tel(p)" class="block font-semibold text-navy transition hover:text-gold">{{ p }}</a> }
            </div>
          </div>
        }
        <div class="card-nb flex items-center gap-5">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-white"><nb-icon name="mail" class="h-6 w-6" /></div>
          <div class="min-w-0"><div class="overline">{{ 'contact.email' | translate }}</div>
            @for (e of emails(); track e) { <a [href]="'mailto:' + e" class="block break-all font-semibold text-navy transition hover:text-gold">{{ e }}</a> }
          </div>
        </div>
        <a [href]="company().websiteUrl" target="_blank" rel="noopener" class="card-nb flex items-center gap-5 transition hover:border-gold">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white"><nb-icon name="globe" class="h-6 w-6" /></div>
          <div><div class="overline">{{ 'contact.website' | translate }}</div><div class="font-semibold text-navy">{{ company().website }}</div></div>
        </a>
        <div class="card-nb flex items-center gap-5">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white"><nb-icon name="pin" class="h-6 w-6" /></div>
          <div><div class="overline">{{ 'contact.headquarters' | translate }}</div><div class="font-semibold text-navy">{{ company().location }}</div></div>
        </div>
        <div class="card-nb flex items-center gap-5">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white"><nb-icon name="chat" class="h-6 w-6" /></div>
          <div><div class="overline">{{ 'contact.languages' | translate }}</div><div class="font-semibold text-navy">{{ company().languages.join(' · ') }}</div></div>
        </div>
        @if (socials.length) {
          <div class="card-nb">
            <div class="overline">{{ 'topbar.follow' | translate }}</div>
            <ul class="mt-3 flex flex-wrap gap-3">
              @for (s of socials; track s.id) {
                <li>
                  @if (s.url) {
                    <a [href]="s.url" target="_blank" rel="noopener noreferrer" [attr.title]="s.label"
                       [attr.aria-label]="'topbar.social' | translate: { name: s.label }"
                       class="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white transition hover:bg-gold hover:text-navy">
                      <nb-social-icon [name]="s.id" class="h-5 w-5" />
                    </a>
                  } @else {
                    <span role="img" [attr.title]="s.label" [attr.aria-label]="s.label"
                          class="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
                      <nb-social-icon [name]="s.id" class="h-5 w-5" />
                    </span>
                  }
                </li>
              }
            </ul>
          </div>
        }
        <div class="overflow-hidden rounded-xl">
          <iframe title="Dallas, Texas" class="h-64 w-full border-0" loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-97.05%2C32.65%2C-96.55%2C32.95&layer=mapnik"></iframe>
        </div>
      </div>

      <div class="lg:col-span-3" nbReveal="right">
        @if (sent()) {
          <div class="rounded-2xl border-t-[3px] border-gold bg-ivory p-10 text-center">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white"><nb-icon name="check" class="h-8 w-8" /></div>
            <h2 class="h3 mt-6">{{ 'contact.sent.title' | translate }}</h2>
            <p class="mt-3">{{ 'contact.sent.text' | translate }}</p>
            <button class="btn btn-outline mt-8" (click)="sent.set(false)">{{ 'contact.sent.again' | translate }}</button>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="card-nb !p-8 md:!p-10" novalidate>
            <h2 class="h3">{{ 'contact.form.title' | translate }}</h2>
            <div class="mt-8 grid gap-5 md:grid-cols-2">
              <label class="field"><span>{{ 'form.fullName' | translate }} *</span><input class="input" formControlName="name" autocomplete="name"></label>
              <label class="field"><span>{{ 'contact.email' | translate }} *</span><input class="input" type="email" formControlName="email" autocomplete="email"></label>
              <label class="field md:col-span-2"><span>{{ 'contact.form.subject' | translate }} *</span><input class="input" formControlName="subject"></label>
              <label class="field md:col-span-2"><span>{{ 'form.message' | translate }} *</span><textarea class="input min-h-[160px]" formControlName="message"></textarea></label>
            </div>
            @if (error()) { <p class="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-danger" role="alert">{{ 'contact.form.error' | translate }}</p> }
            @if (sendError()) { <p class="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-danger" role="alert">{{ 'form.sendError' | translate: { email: company().email } }}</p> }
            <div class="mt-8 flex flex-wrap items-center gap-4">
              <button type="submit" class="btn btn-primary disabled:cursor-wait disabled:opacity-70" [disabled]="sending()">
                {{ (sending() ? 'form.sending' : 'contact.form.submit') | translate }} <nb-icon name="arrow" class="h-5 w-5" /></button>
              <a routerLink="/quote" class="link-arrow">{{ 'contact.form.quoteLink' | translate }}</a>
            </div>
          </form>
        }
        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          @for (m of markets(); track m.id) {
            <div class="flex items-center gap-4 rounded-xl border border-mist p-4">
              <img [src]="img(m.image, 160, 160)" alt="" class="h-14 w-14 rounded-lg object-cover" loading="lazy">
              <div><div class="font-display font-bold text-navy">{{ m.name }}</div><div class="text-xs text-steel">{{ m.cities.join(' · ') }}</div></div>
            </div>
          }
        </div>
      </div>
    </div>
  </section>
  `,
})
export class ContactComponent {
  private store = inject(StoreService);
  private fb = inject(FormBuilder);
  private lang = inject(LanguageService);
  readonly company = computed(() => this.lang.obj('data.company', COMPANY));
  readonly emails = computed(() => [this.company().email, ...CONTACT.emails]);
  readonly phones = CONTACT.phones;
  readonly tel = telHref;
  readonly markets = computed(() => this.lang.list('data.markets', MARKETS));
  readonly img = img;
  /** Tous les réseaux sont affichés ; l'icône n'est cliquable que si son URL est renseignée. */
  readonly socials = SOCIALS;
  readonly sent = signal(false);
  readonly error = signal(false);
  readonly sending = signal(false);
  readonly sendError = signal(false);
  private mail = inject(MailService);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  async submit() {
    if (this.sending()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set(true); return; }
    this.error.set(false);
    this.sendError.set(false);
    this.sending.set(true);
    const msg = this.form.getRawValue();
    try {
      await this.mail.sendContact(msg); // envoi par e-mail à l'adresse de l'entreprise
      this.store.addMessage(msg);
      this.form.reset();
      this.sent.set(true);
    } catch {
      this.sendError.set(true); // le formulaire reste rempli pour réessayer
    } finally {
      this.sending.set(false);
    }
  }
}
