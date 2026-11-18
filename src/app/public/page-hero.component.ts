import { AfterViewInit, Component, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { img } from '../core/data/company';
import { prefersReducedMotion } from '../shared/gsap.directives';

/** Bandeau de titre des pages intérieures. */
@Component({
  selector: 'nb-page-hero',
  standalone: false,
  template: `
  <section class="relative overflow-hidden bg-navy">
    @if (image) { <img [src]="img(image, 1800, 600)" alt="" class="absolute inset-0 h-full w-full object-cover opacity-25"> }
    <div class="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50"></div>
    <svg class="pointer-events-none absolute bottom-0 right-0 h-full opacity-70" viewBox="0 0 400 220" aria-hidden="true">
      <g fill="none" stroke="#C9A24B"><path d="M40 230A170 170 0 0 1 380 230" stroke-width="1.6"/><path d="M90 230A120 120 0 0 1 330 230" opacity=".45"/><path d="M140 230A70 70 0 0 1 280 230" opacity=".25"/></g>
    </svg>
    <div class="container-nb relative py-20 md:py-24">
      <p class="ph-anim overline !text-gold">{{ kicker }}</p>
      <h1 class="ph-anim mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight text-white md:text-5xl">{{ title }}</h1>
      @if (subtitle) { <p class="ph-anim mt-5 max-w-2xl text-lg text-[#C9D3E0]">{{ subtitle }}</p> }
    </div>
  </section>`,
})
export class PageHeroComponent implements AfterViewInit, OnDestroy {
  @Input() kicker = '';
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input() image = '';
  readonly img = img;
  private el = inject(ElementRef<HTMLElement>);
  private ctx?: gsap.Context;

  ngAfterViewInit() {
    if (prefersReducedMotion()) return;
    this.ctx = gsap.context(() => {
      gsap.from('.ph-anim', { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' });
    }, this.el.nativeElement);
  }
  ngOnDestroy() { this.ctx?.revert(); }
}
