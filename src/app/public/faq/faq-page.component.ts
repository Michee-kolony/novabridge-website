import { Component, OnDestroy, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { COMPANY } from '../../core/data/company';
import { LanguageService } from '../../core/services/language.service';
import { FaqItem } from './faq-accordion.component';

/** Page /faq : toutes les questions + données structurées FAQPage (référencement Google). */
@Component({
  selector: 'nb-faq-page',
  standalone: false,
  template: `
  <nb-page-hero [kicker]="'faq.kicker' | translate" [title]="'faq.title' | translate"
    [subtitle]="'faq.subtitle' | translate" image="photo-1586528116311-ad8dd3c8310d" />

  <section class="section">
    <div class="container-nb grid gap-10 lg:grid-cols-3 lg:gap-14">
      <div class="lg:col-span-2" nbReveal>
        <nb-faq-accordion [items]="items()" />
      </div>
      <aside nbReveal="right">
        <div class="rounded-2xl bg-navy p-8 text-[#C9D3E0] lg:sticky lg:top-32">
          <nb-icon name="chat" class="h-10 w-10 text-white" />
          <h2 class="mt-4 font-display text-xl font-bold text-white">{{ 'faq.more.title' | translate }}</h2>
          <p class="mt-2 text-sm leading-relaxed">{{ 'faq.more.text' | translate }}</p>
          <a routerLink="/contact" class="btn btn-gold mt-6 w-full justify-center">{{ 'faq.more.cta' | translate }}</a>
          <a [href]="'mailto:' + email" class="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-white hover:text-gold">
            <nb-icon name="mail" class="h-4 w-4" />{{ email }}
          </a>
        </div>
      </aside>
    </div>
  </section>
  `,
})
export class FaqPageComponent implements OnDestroy {
  private lang = inject(LanguageService);
  private document = inject(DOCUMENT);
  readonly email = COMPANY.email;
  readonly items = computed(() => this.lang.t<FaqItem[]>('faq.items', []));
  private script?: HTMLScriptElement;

  constructor() {
    // Données structurées schema.org/FAQPage, mises à jour à chaque changement de langue.
    effect(() => {
      const items = this.items();
      if (!Array.isArray(items) || !items.length) return;
      this.script ??= Object.assign(this.document.createElement('script'), { type: 'application/ld+json' });
      this.script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
      });
      if (!this.script.isConnected) this.document.head.appendChild(this.script);
    });
  }

  ngOnDestroy() { this.script?.remove(); }
}
