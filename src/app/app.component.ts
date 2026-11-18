import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { filter, first } from 'rxjs';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Durée minimale d'affichage du splash (évite un flash trop bref). */
const SPLASH_MIN_MS = 800;

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<router-outlet />`,
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    // Recalcule les déclencheurs GSAP après chaque changement de page.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => setTimeout(() => ScrollTrigger.refresh(), 150));

    // Masque le splash screen (défini dans index.html) une fois la première page chargée.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError), first())
      .subscribe(() => this.hideSplash());
  }

  private hideSplash(): void {
    const splash = this.document.getElementById('nb-splash');
    if (!splash) return;
    const elapsed = performance.now();
    setTimeout(() => {
      splash.classList.add('nb-splash--hide');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      setTimeout(() => splash.remove(), 1000); // filet de sécurité
    }, Math.max(0, SPLASH_MIN_MS - elapsed));
  }
}
