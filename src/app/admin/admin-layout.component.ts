import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { StoreService } from '../core/services/store.service';

@Component({
  selector: 'nb-admin-layout',
  standalone: false,
  template: `
  <div class="flex min-h-screen bg-cloud">
    <!-- Barre latérale -->
    <aside class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-[#C9D3E0] transition-transform lg:translate-x-0"
           [class.-translate-x-full]="!open()">
      <div class="flex h-20 items-center border-b border-white/10 px-6">
        <img src="logos/logo-horizontal-negatif-transparent.svg" alt="NovaBridge" class="h-10 w-auto">
      </div>
      <nav class="flex-1 space-y-1 p-4" aria-label="Administration">
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
      <div class="border-t border-white/10 p-4">
        <a routerLink="/" target="_blank" class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-white/5 hover:text-white"><nb-icon name="external" class="h-5 w-5" />Voir le site</a>
        <button (click)="logout()" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-white/5 hover:text-white"><nb-icon name="logout" class="h-5 w-5" />Déconnexion</button>
      </div>
    </aside>
    @if (open()) { <div class="fixed inset-0 z-30 bg-navy/50 lg:hidden" (click)="open.set(false)"></div> }

    <!-- Contenu -->
    <div class="flex min-w-0 flex-1 flex-col lg:pl-64">
      <header class="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-mist bg-white/95 px-6 backdrop-blur lg:px-10">
        <button class="rounded p-2 text-navy lg:hidden" (click)="open.set(true)" aria-label="Menu"><nb-icon name="menu" class="h-6 w-6" /></button>
        <div class="hidden text-sm text-steel lg:block">Back-office · <span class="font-semibold text-navy">NovaBridge Global Supply LLC</span></div>
        <div class="flex items-center gap-3">
          <span class="hidden rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-gold-deep sm:inline">Mode démo · données locales</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold">{{ initials() }}</div>
        </div>
      </header>
      <main class="flex-1 p-6 lg:p-10"><router-outlet /></main>
    </div>
  </div>`,
})
export class AdminLayoutComponent {
  readonly store = inject(StoreService);
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly open = signal(false);
  readonly links = [
    { path: '/admin', label: 'Tableau de bord', icon: 'dashboard', exact: true },
    { path: '/admin/devis', label: 'Demandes de devis', icon: 'file', exact: false },
    { path: '/admin/messages', label: 'Messages', icon: 'mail', exact: false },
    { path: '/admin/annonces', label: 'Annonces', icon: 'megaphone', exact: false },
    { path: '/admin/produits', label: 'Catalogue produits', icon: 'grid', exact: false },
    { path: '/admin/parametres', label: 'Paramètres', icon: 'settings', exact: false },
  ];

  initials() { return (this.auth.email() ?? 'A').slice(0, 2).toUpperCase(); }

  logout() { this.auth.logout(); this.router.navigateByUrl('/admin/login'); }
}
