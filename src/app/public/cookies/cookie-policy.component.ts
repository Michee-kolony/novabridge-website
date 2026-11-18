import { Component, inject } from '@angular/core';
import { COMPANY } from '../../core/data/company';
import { CookieConsentService } from '../../core/cookies/cookie-consent.service';
import { LanguageService } from '../../core/services/language.service';

/** Page « Politique cookies » : générée à partir de cookie.config.ts. */
@Component({
  selector: 'nb-cookie-policy',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'cookies.policy.kicker' | translate" [title]="'cookies.policy.title' | translate"
    [subtitle]="'cookies.policy.subtitle' | translate" image="photo-1553413077-190dd305871c" />

  <section class="section">
    <div class="container-nb grid gap-12 lg:grid-cols-3">
      <div class="space-y-10 lg:col-span-2">
        <div>
          <h2 class="h3">{{ 'cookies.policy.what.title' | translate }}</h2>
          <p class="mt-3 leading-relaxed">{{ 'cookies.policy.what.text' | translate }}</p>
        </div>
        <div>
          <h2 class="h3">{{ 'cookies.policy.how.title' | translate }}</h2>
          <p class="mt-3 leading-relaxed">{{ 'cookies.policy.how.text' | translate }}</p>
        </div>
        <div>
          <h2 class="h3">{{ 'cookies.policy.categoriesTitle' | translate }}</h2>
          <div class="mt-6 space-y-8">
            @for (cat of consent.categories; track cat.id) {
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="font-display text-lg font-bold text-navy">{{ 'cookies.categories.' + cat.id + '.name' | translate }}</h3>
                  @if (cat.required) { <span class="badge">{{ 'cookies.settings.alwaysActive' | translate }}</span> }
                  @else if (consent.allowed(cat.id)) { <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-success">{{ 'cookies.policy.status.on' | translate }}</span> }
                  @else { <span class="rounded-full bg-cloud px-3 py-1 text-xs font-semibold text-steel">{{ 'cookies.policy.status.off' | translate }}</span> }
                </div>
                <p class="mt-2 text-steel">{{ 'cookies.categories.' + cat.id + '.description' | translate }}</p>
                <nb-cookie-table class="mt-4 block" [cookies]="cat.cookies" />
              </div>
            }
          </div>
        </div>
        <div>
          <h2 class="h3">{{ 'cookies.policy.browser.title' | translate }}</h2>
          <p class="mt-3 leading-relaxed">{{ 'cookies.policy.browser.text' | translate }}</p>
        </div>
      </div>

      <aside class="space-y-6">
        <div class="rounded-2xl bg-navy p-8 text-[#C9D3E0] lg:sticky lg:top-28">
          <nb-icon name="cookie" class="h-10 w-10 text-white" />
          <h2 class="mt-4 font-display text-xl font-bold text-white">{{ 'cookies.policy.manage.title' | translate }}</h2>
          <p class="mt-2 text-sm">
            @if (consent.state(); as s) {
              {{ 'cookies.policy.status.given' | translate: { date: (s.date | date: 'longDate' : undefined : lang.locale()) } }}
            } @else {
              {{ 'cookies.policy.status.none' | translate }}
            }
          </p>
          <button type="button" class="btn btn-gold mt-6 w-full justify-center" (click)="consent.openSettings()">{{ 'cookies.policy.manage.button' | translate }}</button>
          <p class="mt-6 text-xs">{{ 'cookies.policy.contact' | translate }} <a [href]="'mailto:' + email" class="text-gold hover:underline">{{ email }}</a></p>
        </div>
      </aside>
    </div>
  </section>
  `,
})
export class CookiePolicyComponent {
  readonly consent = inject(CookieConsentService);
  readonly lang = inject(LanguageService);
  readonly email = COMPANY.email;
}
