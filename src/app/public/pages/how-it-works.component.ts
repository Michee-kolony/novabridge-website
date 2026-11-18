import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject, viewChild } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

import { gsap } from 'gsap';
import { ADVANTAGES, STEPS, img } from '../../core/data/company';
import { prefersReducedMotion } from '../../shared/gsap.directives';

@Component({
  selector: 'nb-how',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'nav.howItWorks' | translate" [title]="'how.hero.title' | translate"
    [subtitle]="'how.hero.subtitle' | translate"
    image="photo-1553413077-190dd305871c" />

  <section class="section">
    <div #timeline class="container-nb relative max-w-4xl">
      <div class="absolute bottom-0 left-[39px] top-0 w-[3px] bg-mist md:left-1/2 md:-ml-[1.5px]"></div>
      <div class="progress absolute left-[39px] top-0 w-[3px] origin-top bg-gold md:left-1/2 md:-ml-[1.5px]" style="height:100%"></div>
      @for (s of steps(); track s.n; let i = $index) {
        <div class="relative mb-14 flex items-start gap-8 last:mb-0 md:w-1/2" [class]="i % 2 ? 'md:ml-auto md:pl-14' : 'md:pr-14 md:flex-row-reverse md:text-right'">
          <div class="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-navy font-display text-2xl font-extrabold text-gold shadow-nb md:absolute md:top-0"
               [class]="i % 2 ? 'md:-left-10' : 'md:-right-10'">{{ s.n }}</div>
          <div class="card-nb flex-1" nbReveal [revealDelay]="0.05">
            <h2 class="font-display text-xl font-bold text-navy">{{ s.title }}</h2>
            <p class="mt-2 text-steel">{{ s.text }}</p>
            <p class="mt-3 text-sm text-slate">{{ details()[i] }}</p>
          </div>
        </div>
      }
    </div>
  </section>

  <section class="section bg-ivory">
    <div class="container-nb">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <img nbReveal="left" [src]="img('photo-1581092160562-40aa08e78837', 1100, 800)" [alt]="'how.commitments.imageAlt' | translate" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-nb-lg" loading="lazy">
        <div nbReveal="right">
          <p class="overline">{{ 'how.commitments.kicker' | translate }}</p>
          <h2 class="h2 mt-3">{{ 'how.commitments.title' | translate }}</h2>
          <div class="mt-8 grid gap-5 sm:grid-cols-2">
            @for (a of advantages(); track a.icon) {
              <div class="flex gap-3"><nb-icon [name]="a.icon" class="h-7 w-7 text-navy" /><div><h3 class="font-display font-bold text-navy">{{ a.title }}</h3><p class="text-sm text-steel">{{ a.text }}</p></div></div>
            }
          </div>
          <a routerLink="/quote" class="btn btn-primary mt-10">{{ 'how.commitments.cta' | translate }}</a>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class HowItWorksComponent implements AfterViewInit, OnDestroy {
  private lang = inject(LanguageService);
  readonly steps = computed(() => this.lang.list('data.steps', STEPS));
  readonly advantages = computed(() => this.lang.list('data.advantages', ADVANTAGES));
  readonly img = img;
  private readonly detailsEn = [
    'Use our quote form or e-mail us. Share references, quantities, sizes, colors and branding needs.',
    'You receive a detailed quote with pricing and a production timeline within 24 hours.',
    'Confirm your order and pay a 50% deposit to launch production with the factory.',
    'The factory produces your order. We send you quality-control photos before every shipment.',
    'Your goods are delivered DDP — customs and freight included. You pay the balance.',
  ];
  readonly details = computed(() => this.lang.t<string[]>('how.details', this.detailsEn));
  private timeline = viewChild.required<ElementRef<HTMLElement>>('timeline');
  private tween?: gsap.core.Tween;

  ngAfterViewInit() {
    if (prefersReducedMotion()) return;
    const el = this.timeline().nativeElement;
    this.tween = gsap.fromTo(el.querySelector('.progress'), { scaleY: 0 }, {
      scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
  }
  ngOnDestroy() { this.tween?.scrollTrigger?.kill(); this.tween?.kill(); }
}
