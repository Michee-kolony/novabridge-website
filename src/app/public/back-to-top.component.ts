import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CookieConsentService } from '../core/cookies/cookie-consent.service';
import { prefersReducedMotion } from '../shared/gsap.directives';

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Distance de défilement (px) à partir de laquelle le bouton apparaît. */
const SHOW_AFTER = 300;
/** Marge entre le bouton et le bas de l'écran (ou le haut du bandeau cookies). */
const GAP = 24;

/** Bouton « Retour en haut » (chevron) avec anneau doré indiquant la progression du défilement. */
@Component({
  selector: 'nb-back-to-top',
  standalone: false,
  template: `
  <button type="button" (click)="toTop()" [attr.aria-label]="'common.backToTop' | translate" [attr.title]="'common.backToTop' | translate"
          [attr.tabindex]="visible() ? 0 : -1" [attr.aria-hidden]="!visible()"
          [style.bottom.px]="bottom()"
          class="group fixed right-5 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-nb-lg transition-all duration-300 hover:bg-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-6"
          [class]="visible() ? 'pointer-events-auto opacity-100 hover:-translate-y-1' : 'pointer-events-none translate-y-4 opacity-0'">
    <svg class="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" [attr.r]="radius" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="2" />
      <circle cx="24" cy="24" [attr.r]="radius" fill="none" stroke="#C9A24B" stroke-width="2" stroke-linecap="round"
              [attr.stroke-dasharray]="circumference" [attr.stroke-dashoffset]="circumference * (1 - progress())" />
    </svg>
    <nb-icon name="chevron-up" class="relative h-6 w-6 transition-transform group-hover:-translate-y-0.5" />
  </button>
  `,
})
export class BackToTopComponent {
  private consent = inject(CookieConsentService);
  private document = inject(DOCUMENT);
  readonly radius = RADIUS;
  readonly circumference = CIRCUMFERENCE;
  readonly visible = signal(false);
  readonly progress = signal(0);
  private bannerHeight = signal(0);
  /** Si le bandeau cookies est affiché, le bouton se place juste au-dessus. */
  readonly bottom = computed(() => (this.consent.bannerVisible() ? this.bannerHeight() : 0) + GAP);

  constructor() {
    this.onScroll();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll() {
    const win = this.document.defaultView;
    if (!win) return;
    const max = this.document.documentElement.scrollHeight - win.innerHeight;
    this.visible.set(win.scrollY > SHOW_AFTER);
    this.progress.set(max > 0 ? Math.min(1, win.scrollY / max) : 0);
    const banner = this.document.querySelector<HTMLElement>('nb-cookie-banner > div');
    this.bannerHeight.set(banner?.offsetHeight ?? 0);
  }

  toTop() {
    this.document.defaultView?.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}
