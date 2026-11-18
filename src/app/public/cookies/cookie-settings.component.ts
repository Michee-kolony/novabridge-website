import { Component, ElementRef, HostListener, effect, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ConsentChoices, CookieConsentService } from '../../core/cookies/cookie-consent.service';
import { CookieCategoryId } from '../../core/cookies/cookie.config';

/** Fenêtre modale de personnalisation des cookies, catégorie par catégorie. */
@Component({
  selector: 'nb-cookie-settings',
  standalone: false,
  template: `
  @if (consent.settingsOpen()) {
    <div class="nb-fade-in fixed inset-0 z-[70] flex items-end justify-center bg-navy/60 backdrop-blur-sm sm:items-center sm:p-5" (click)="onBackdrop($event)">
      <div #dialog role="dialog" aria-modal="true" aria-labelledby="nb-cookie-title" tabindex="-1"
           class="nb-slide-up flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-nb-lg outline-none sm:rounded-2xl">
        <!-- En-tête -->
        <div class="flex items-center justify-between gap-4 border-b border-mist px-6 py-5">
          <div class="flex items-center gap-3">
            <nb-icon name="cookie" class="h-8 w-8 text-navy" />
            <h2 id="nb-cookie-title" class="font-display text-xl font-bold text-navy">{{ 'cookies.settings.title' | translate }}</h2>
          </div>
          <button type="button" class="rounded-lg p-2 text-navy hover:bg-ivory" (click)="consent.closeSettings()" [attr.aria-label]="'cookies.settings.close' | translate">
            <nb-icon name="close" class="h-5 w-5" />
          </button>
        </div>

        <!-- Catégories -->
        <div class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <p class="text-sm leading-relaxed text-slate">
            {{ 'cookies.settings.intro' | translate }}
            <a routerLink="/cookies" (click)="consent.closeSettings()" class="font-semibold text-atlantic hover:underline">{{ 'cookies.banner.policy' | translate }}</a>
          </p>
          @for (cat of consent.categories; track cat.id) {
            <section class="rounded-xl border border-mist p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-display font-bold text-navy">{{ 'cookies.categories.' + cat.id + '.name' | translate }}</h3>
                  <p class="mt-1 text-sm text-steel">{{ 'cookies.categories.' + cat.id + '.description' | translate }}</p>
                </div>
                @if (cat.required) {
                  <span class="shrink-0 rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-gold-deep">{{ 'cookies.settings.alwaysActive' | translate }}</span>
                } @else {
                  <button type="button" role="switch" [attr.aria-checked]="draft()[cat.id]"
                          [attr.aria-label]="'cookies.categories.' + cat.id + '.name' | translate"
                          (click)="toggle(cat.id)"
                          class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                          [class]="draft()[cat.id] ? 'bg-navy' : 'bg-mist'">
                    <span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
                          [class.translate-x-5]="draft()[cat.id]"></span>
                  </button>
                }
              </div>
              <button type="button" class="mt-3 text-xs font-semibold text-atlantic hover:underline" (click)="toggleDetails(cat.id)" [attr.aria-expanded]="details() === cat.id">
                {{ (details() === cat.id ? 'cookies.settings.hide' : 'cookies.settings.show') | translate: { n: cat.cookies.length } }}
              </button>
              @if (details() === cat.id) { <nb-cookie-table class="mt-3 block" [cookies]="cat.cookies" /> }
            </section>
          }
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse gap-3 border-t border-mist bg-ivory/60 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" class="btn btn-outline justify-center" (click)="consent.rejectAll()">{{ 'cookies.settings.reject' | translate }}</button>
          <button type="button" class="btn btn-outline justify-center" (click)="consent.acceptAll()">{{ 'cookies.settings.accept' | translate }}</button>
          <button type="button" class="btn btn-primary justify-center" (click)="consent.save(draft())">{{ 'cookies.settings.save' | translate }}</button>
        </div>
      </div>
    </div>
  }
  `,
})
export class CookieSettingsComponent {
  readonly consent = inject(CookieConsentService);
  private document = inject(DOCUMENT);
  private dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  /** Choix en cours d'édition (enregistrés seulement au clic sur « Enregistrer »). */
  readonly draft = signal<ConsentChoices>(this.consent.choices());
  readonly details = signal<CookieCategoryId | null>(null);

  constructor() {
    effect(() => {
      const open = this.consent.settingsOpen();
      if (open) {
        this.draft.set({ ...this.consent.choices() });
        this.details.set(null);
      }
      this.document.body.style.overflow = open ? 'hidden' : '';
    }, { allowSignalWrites: true });
    // Place le focus dans la fenêtre à l'ouverture (accessibilité clavier).
    effect(() => this.dialog()?.nativeElement.focus());
  }

  toggle(id: CookieCategoryId) { this.draft.update(d => ({ ...d, [id]: !d[id] })); }
  toggleDetails(id: CookieCategoryId) { this.details.update(d => (d === id ? null : id)); }

  onBackdrop(e: MouseEvent) { if (e.target === e.currentTarget) this.consent.closeSettings(); }

  @HostListener('document:keydown.escape')
  onEscape() { if (this.consent.settingsOpen()) this.consent.closeSettings(); }
}
