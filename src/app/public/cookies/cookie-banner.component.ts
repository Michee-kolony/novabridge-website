import { Component, inject } from '@angular/core';
import { CookieConsentService } from '../../core/cookies/cookie-consent.service';

/** Bandeau superposé en bas de page, affiché tant que l'utilisateur n'a pas fait de choix. */
@Component({
  selector: 'nb-cookie-banner',
  standalone: false,
  template: `
  @if (consent.bannerVisible()) {
    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5" role="region" [attr.aria-label]="'cookies.banner.aria' | translate">
      <div class="nb-slide-up pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-white/10 bg-navy p-6 text-[#C9D3E0] shadow-nb-lg md:flex md:items-center md:gap-8 md:p-7">
        <div class="flex flex-1 gap-4">
          <nb-icon name="cookie" class="mt-0.5 hidden h-10 w-10 text-white sm:block" />
          <div>
            <h2 class="font-display text-lg font-bold text-white">{{ 'cookies.banner.title' | translate }}</h2>
            <p class="mt-1.5 text-sm leading-relaxed">
              {{ 'cookies.banner.text' | translate }}
              <a routerLink="/cookies" class="font-semibold text-gold underline-offset-2 hover:underline">{{ 'cookies.banner.policy' | translate }}</a>
            </p>
          </div>
        </div>
        <div class="mt-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:mt-0">
          <button type="button" class="text-sm font-semibold text-white underline-offset-4 hover:text-gold hover:underline sm:mr-2" (click)="consent.openSettings()">{{ 'cookies.banner.customize' | translate }}</button>
          <!-- Refuser est aussi simple qu'accepter (exigence RGPD / CNIL) -->
          <button type="button" class="btn justify-center bg-white text-navy hover:bg-ivory" (click)="consent.rejectAll()">{{ 'cookies.banner.reject' | translate }}</button>
          <button type="button" class="btn btn-gold justify-center" (click)="consent.acceptAll()">{{ 'cookies.banner.accept' | translate }}</button>
        </div>
      </div>
    </div>
  }
  `,
})
export class CookieBannerComponent {
  readonly consent = inject(CookieConsentService);
}
