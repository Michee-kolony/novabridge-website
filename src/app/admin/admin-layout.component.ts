import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { StoreService } from '../core/services/store.service';

@Component({
  selector: 'nb-admin-layout',
  standalone: false,
  template: `
  <div class="flex min-h-screen bg-cloud">
    <!-- Barre latérale : fixe sur grand écran, tiroir coulissant sur mobile / tablette -->
    <aside id="nb-admin-nav" class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy text-[#C9D3E0] shadow-nb-lg transition-transform duration-300 lg:w-64 lg:translate-x-0 lg:shadow-none"
           [class.-translate-x-full]="!open()" [attr.aria-hidden]="!open() && !isDesktop() ? true : null">
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 lg:h-20 lg:px-6">
        <img src="logos/logo-horizontal-negatif-transparent.svg" alt="NovaBridge" class="h-9 w-auto lg:h-10">
        <button type="button" class="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden" (click)="open.set(false)" aria-label="Fermer le menu">
          <nb-icon name="close" class="h-5 w-5" />
        </button>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto p-3 lg:p-4" aria-label="Administration">
        @for (l of links; track l.path) {
          <a [routerLink]="l.path" routerLinkActive="!bg-white/10 !text-white" [routerLinkActiveOptions]="{ exact: l.exact }"
             (click)="open.set(false)"
             class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition hover:bg-white/5 hover:text-white">
            <nb-icon [name]="l.icon" class="h-5 w-5" />
            <span class="flex-1">{{ l.label }}</span>
            @if (l.path === '/admin/devis' && store.newQuotesCount()) { <span class="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">{{ store.newQuotesCount() }}</span> }
            @if (l.path === '/admin/messages' && store.unreadMessagesCount()) { <span class="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">{{ store.unreadMessagesCount() }}</span> }
          </a>
        }
      </nav>
      <div class="shrink-0 border-t border-white/10 p-3 lg:p-4">
        <a routerLink="/" target="_blank" class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-white/5 hover:text-white"><nb-icon name="external" class="h-5 w-5" />Voir le site</a>
        <button (click)="logout()" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-white/5 hover:text-white"><nb-icon name="logout" class="h-5 w-5" />Déconnexion</button>
      </div>
    </aside>
    @if (open()) { <div class="nb-fade-in fixed inset-0 z-40 bg-navy/50 backdrop-blur-[2px] lg:hidden" (click)="open.set(false)"></div> }

    <!-- Contenu -->
    <div class="flex min-w-0 flex-1 flex-col lg:pl-64">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-mist bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-10">
        <div class="flex min-w-0 items-center gap-2">
          <button class="-ml-2 rounded-lg p-2 text-navy hover:bg-cloud lg:hidden" (click)="open.set(true)" aria-label="Ouvrir le menu" aria-controls="nb-admin-nav" [attr.aria-expanded]="open()">
            <nb-icon name="menu" class="h-6 w-6" />
          </button>
          <img src="logos/logo-horizontal-couleur.svg" alt="NovaBridge" class="h-8 w-auto lg:hidden">
          <div class="hidden text-sm text-steel lg:block">Back-office · <span class="font-semibold text-navy">NovaBridge Global Supply LLC</span></div>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <span class="hidden rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-gold-deep md:inline">Mode démo · données locales</span>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold lg:h-10 lg:w-10" [attr.title]="auth.email()">{{ initials() }}</div>
        </div>
      </header>
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-10"><router-outlet /></main>
    </div>
  </div>`,
})
export class AdminLayoutComponent {
  readonly store = inject(StoreService);
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  readonly open = signal(false);
  readonly isDesktop = signal(this.document.defaultView?.matchMedia('(min-width: 1024px)').matches ?? true);
  readonly links = [
    { path: '/admin', label: 'Tableau de bord', icon: 'dashboard', exact: true },
    { path: '/admin/devis', label: 'Demandes de devis', icon: 'file', exact: false },
    { path: '/admin/messages', label: 'Messages', icon: 'mail', exact: false },
    { path: '/admin/annonces', label: 'Annonces', icon: 'megaphone', exact: false },
    { path: '/admin/produits', label: 'Catalogue produits', icon: 'grid', exact: false },
    { path: '/admin/parametres', label: 'Paramètres', icon: 'settings', exact: false },
  ];

  constructor() {
    // Empêche la page de défiler derrière le tiroir ouvert (mobile).
    effect(() => { this.document.body.style.overflow = this.open() ? 'hidden' : ''; });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.open.set(false); }

  @HostListener('window:resize')
  onResize() {
    const desktop = this.document.defaultView?.matchMedia('(min-width: 1024px)').matches ?? true;
    this.isDesktop.set(desktop);
    if (desktop) this.open.set(false);
  }

  initials() { return (this.auth.email() ?? 'A').slice(0, 2).toUpperCase(); }

  logout() { this.auth.logout(); this.router.navigateByUrl('/admin/login'); }
}
