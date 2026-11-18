import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Révèle un élément au défilement.
 *  nbReveal="up" | "left" | "right" | "fade" | "scale" | "stagger"
 *  "stagger" anime les enfants directs les uns après les autres.
 */
@Directive({ selector: '[nbReveal]', standalone: false })
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() nbReveal: '' | 'up' | 'left' | 'right' | 'fade' | 'scale' | 'stagger' = 'up';
  @Input() revealDelay = 0;
  private el = inject(ElementRef<HTMLElement>);
  private tween?: gsap.core.Tween;

  ngAfterViewInit() {
    if (prefersReducedMotion()) return;
    const node = this.el.nativeElement as HTMLElement;
    const mode = this.nbReveal || 'up';
    const from: gsap.TweenVars = { opacity: 0, duration: 0.9, ease: 'power3.out', delay: this.revealDelay };
    if (mode === 'up' || mode === 'stagger') from.y = 40;
    if (mode === 'left') from.x = -60;
    if (mode === 'right') from.x = 60;
    if (mode === 'scale') from.scale = 0.92;
    const targets = (mode === 'stagger' ? Array.from(node.children) : [node]) as HTMLElement[];
    if (mode === 'stagger') from.stagger = 0.12;
    // Les transitions CSS (hover) entrent en conflit avec GSAP : on les coupe pendant l'animation.
    targets.forEach(t => (t.style.transition = 'none'));
    this.tween = gsap.from(targets, {
      ...from,
      clearProps: 'opacity,transform,transition',
      scrollTrigger: { trigger: node, start: 'top 88%', once: true },
    });
  }

  ngOnDestroy() {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}

/** Compteur animé : <span [nbCountUp]="40" suffix="%"></span> */
@Directive({ selector: '[nbCountUp]', standalone: false })
export class CountUpDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) nbCountUp!: number;
  private el = inject(ElementRef<HTMLElement>);
  private tween?: gsap.core.Tween;

  ngAfterViewInit() {
    const node = this.el.nativeElement as HTMLElement;
    if (prefersReducedMotion()) { node.textContent = String(this.nbCountUp); return; }
    const counter = { v: 0 };
    node.textContent = '0';
    this.tween = gsap.to(counter, {
      v: this.nbCountUp, duration: 1.8, ease: 'power2.out',
      onUpdate: () => (node.textContent = Math.round(counter.v).toString()),
      scrollTrigger: { trigger: node, start: 'top 90%', once: true },
    });
  }

  ngOnDestroy() {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}

/** Léger effet de parallaxe sur une image de fond. */
@Directive({ selector: '[nbParallax]', standalone: false })
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  @Input() nbParallax = 12;
  private el = inject(ElementRef<HTMLElement>);
  private tween?: gsap.core.Tween;

  ngAfterViewInit() {
    if (prefersReducedMotion()) return;
    const node = this.el.nativeElement as HTMLElement;
    this.tween = gsap.fromTo(node, { yPercent: -this.nbParallax / 2 }, {
      yPercent: this.nbParallax / 2, ease: 'none',
      scrollTrigger: { trigger: node.parentElement ?? node, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  ngOnDestroy() {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}
