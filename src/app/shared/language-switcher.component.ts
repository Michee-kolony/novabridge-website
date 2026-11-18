import { Component, ElementRef, HostListener, Input, inject, signal } from '@angular/core';
import { Lang, LanguageService } from '../core/services/language.service';

/**
 * Sélecteur de langue.
 *  variant="dropdown" : bouton + menu déroulant (en-tête desktop)
 *  variant="inline"   : boutons côte à côte (menu mobile)
 */
@Component({
  selector: 'nb-language-switcher',
  standalone: false,
  template: `
  @if (variant === 'inline') {
    <div class="grid grid-cols-2 gap-2" role="group" [attr.aria-label]="'lang.choose' | translate">
      @for (l of lang.languages; track l.code) {
        <button type="button" (click)="select(l.code)" [attr.lang]="l.html" [attr.aria-pressed]="lang.current() === l.code"
                class="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition"
                [class]="lang.current() === l.code ? 'border-navy bg-navy text-white' : 'border-mist text-navy hover:border-navy'">
          <img [src]="l.flag" alt="" class="h-2.5 w-[15px] shrink-0 rounded-[1px] object-cover ring-1 ring-black/10">{{ l.label }}
        </button>
      }
    </div>
  } @else {
    <div class="relative">
      <button type="button" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-haspopup="listbox"
              [attr.aria-label]="'lang.choose' | translate"
              class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors hover:text-gold"
              [class]="light ? 'text-white' : 'text-navy'">
        <nb-icon name="globe" class="h-5 w-5" />
        <span>{{ lang.option().short }}</span>
        <svg class="h-3 w-3 transition-transform" [class.rotate-180]="open()" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
      </button>
      @if (open()) {
        <ul role="listbox" class="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-mist bg-white py-1 shadow-nb-lg">
          @for (l of lang.languages; track l.code) {
            <li role="option" [attr.aria-selected]="lang.current() === l.code">
              <button type="button" (click)="select(l.code)" [attr.lang]="l.html"
                      class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-navy hover:bg-ivory"
                      [class.font-bold]="lang.current() === l.code">
                <span class="flex items-center gap-2.5"><img [src]="l.flag" alt="" class="h-3 w-[18px] shrink-0 rounded-[1px] object-cover ring-1 ring-black/10">{{ l.label }}</span>
                @if (lang.current() === l.code) { <nb-icon name="check" class="h-4 w-4" /> }
              </button>
            </li>
          }
        </ul>
      }
    </div>
  }
  `,
})
export class LanguageSwitcherComponent {
  @Input() variant: 'dropdown' | 'inline' = 'dropdown';
  /** Texte blanc (en-tête transparent sur le hero). */
  @Input() light = false;
  readonly lang = inject(LanguageService);
  readonly open = signal(false);
  private el = inject(ElementRef<HTMLElement>);

  select(code: Lang) {
    this.lang.set(code);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.open.set(false); }
}
