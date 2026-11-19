import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../../shared/gsap.directives';

export interface FaqItem { q: string; a: string; }

let uid = 0;

/**
 * Accordéon FAQ animé avec GSAP.
 *  - une seule réponse ouverte à la fois (la précédente se referme) ;
 *  - ouverture / fermeture en douceur (hauteur + fondu + léger glissement du texte) ;
 *  - accessible : boutons natifs, aria-expanded / aria-controls, réponses fermées masquées aux lecteurs d'écran.
 */
@Component({
  selector: 'nb-faq-accordion',
  standalone: false,
  template: `
  <div class="divide-y divide-mist overflow-hidden rounded-2xl border border-mist bg-white shadow-nb-sm">
    @for (item of items; track $index; let i = $index) {
      <div class="faq-item transition-colors duration-300" [class.bg-ivory]="openIndex() === i">
        <h3>
          <button type="button" [id]="id + '-q' + i" [attr.aria-expanded]="openIndex() === i" [attr.aria-controls]="id + '-a' + i"
                  (click)="toggle(i)"
                  class="group flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7 sm:py-6">
            <span class="font-display text-base font-bold text-navy transition-colors group-hover:text-atlantic sm:text-lg">{{ item.q }}</span>
            <!-- Icône + qui pivote en × -->
            <span class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
                  [class]="openIndex() === i ? 'rotate-45 border-gold bg-gold text-navy' : 'border-mist text-navy group-hover:border-navy'">
              <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </span>
          </button>
        </h3>
        <div #panel [id]="id + '-a' + i" role="region" [attr.aria-labelledby]="id + '-q' + i"
             class="overflow-hidden" style="height: 0; visibility: hidden">
          <p class="faq-answer px-5 pb-6 pr-16 leading-relaxed text-slate sm:px-7 sm:pr-20">{{ item.a }}</p>
        </div>
      </div>
    }
  </div>
  `,
})
export class FaqAccordionComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) items: FaqItem[] = [];
  /** Index ouvert au chargement (-1 = tout fermé). */
  @Input() initiallyOpen = 0;

  @ViewChildren('panel') private panels!: QueryList<ElementRef<HTMLElement>>;
  readonly openIndex = signal(-1);
  readonly id = `nb-faq-${++uid}`;
  private host = inject(ElementRef<HTMLElement>);

  ngAfterViewInit() {
    const first = this.panels.get(this.initiallyOpen)?.nativeElement;
    if (first) {
      gsap.set(first, { height: 'auto', visibility: 'visible' });
      this.openIndex.set(this.initiallyOpen);
    }
  }

  toggle(i: number) {
    const previous = this.openIndex();
    if (previous === i) {
      this.close(i);
      this.openIndex.set(-1);
      return;
    }
    if (previous !== -1) this.close(previous);
    this.open(i);
    this.openIndex.set(i);
  }

  private open(i: number) {
    const panel = this.panels.get(i)?.nativeElement;
    if (!panel) return;
    const answer = panel.querySelector('.faq-answer');
    gsap.killTweensOf([panel, answer]);
    if (prefersReducedMotion()) { gsap.set(panel, { height: 'auto', visibility: 'visible' }); return; }
    gsap.set(panel, { visibility: 'visible' });
    gsap.fromTo(panel, { height: panel.offsetHeight }, { height: 'auto', duration: 0.45, ease: 'power3.out' });
    gsap.fromTo(answer, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.08, ease: 'power2.out' });
  }

  private close(i: number) {
    const panel = this.panels.get(i)?.nativeElement;
    if (!panel) return;
    const answer = panel.querySelector('.faq-answer');
    gsap.killTweensOf([panel, answer]);
    if (prefersReducedMotion()) { gsap.set(panel, { height: 0, visibility: 'hidden' }); return; }
    gsap.to(answer, { opacity: 0, y: -6, duration: 0.2, ease: 'power1.in' });
    gsap.to(panel, { height: 0, duration: 0.35, ease: 'power3.inOut', onComplete: () => gsap.set(panel, { visibility: 'hidden' }) });
  }

  ngOnDestroy() {
    gsap.killTweensOf(this.host.nativeElement.querySelectorAll('.overflow-hidden, .faq-answer'));
  }
}
