import { Component, inject, signal } from '@angular/core';
import { COMPANY, MARKETS, SOURCING_NETWORK } from '../../core/data/company';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-admin-settings',
  standalone: false,
  template: `
  <h1 class="admin-title">Paramètres</h1>
  <p class="text-sm text-steel">Informations de l'entreprise utilisées sur le site.</p>

  <div class="mt-6 grid gap-4 sm:mt-8 sm:gap-6 xl:grid-cols-2 [&>*]:min-w-0">
    <section class="admin-card">
      <h2 class="admin-h2">Entreprise</h2>
      <dl class="mt-5 space-y-4 break-words text-sm">
        <div><dt class="dt">Raison sociale</dt><dd class="dd">{{ c.name }}</dd></div>
        <div><dt class="dt">Siège</dt><dd class="dd">{{ c.location }}</dd></div>
        <div><dt class="dt">E-mail</dt><dd class="dd">{{ c.email }}</dd></div>
        <div><dt class="dt">Site web</dt><dd class="dd">{{ c.website }}</dd></div>
        <div><dt class="dt">Signature</dt><dd class="dd">{{ c.slogan }}</dd></div>
        <div><dt class="dt">Langues de l'équipe</dt><dd class="dd">{{ c.languages.join(', ') }}</dd></div>
      </dl>
      <p class="mt-6 rounded-lg bg-ivory p-4 text-xs text-slate">Ces informations sont définies dans <code>src/app/core/data/company.ts</code>. Elles deviendront modifiables ici une fois l'API branchée.</p>
    </section>

    <section class="admin-card">
      <h2 class="admin-h2">Marchés & réseau de sourcing</h2>
      <ul class="mt-5 space-y-2 text-sm">@for (m of markets; track m.id) { <li><span class="font-semibold text-navy">{{ m.name }}</span> — {{ m.cities.join(', ') }}</li> }</ul>
      <ul class="mt-5 space-y-2 border-t border-mist pt-5 text-sm">@for (s of network; track s.place) { <li><span class="font-semibold text-navy">{{ s.place }}</span> — {{ s.detail }}</li> }</ul>
    </section>

    <section class="admin-card">
      <h2 class="admin-h2">Compte</h2>
      <p class="mt-4 text-sm">Connecté en tant que <span class="font-semibold text-navy">{{ auth.email() }}</span>.</p>
      <p class="mt-2 text-xs text-steel">Authentification de démonstration : à remplacer par une authentification serveur (JWT) avant la mise en ligne.</p>
    </section>

    <section class="admin-card border-red-200">
      <h2 class="admin-h2 !text-danger">Données de démonstration</h2>
      <p class="mt-4 text-sm">Les données (devis, messages, annonces, catalogue) sont stockées dans ce navigateur. Réinitialisez-les pour revenir au contenu d'origine.</p>
      <button class="btn btn-outline mt-5 !border-danger !text-danger hover:!bg-danger hover:!text-white" (click)="reset()">Réinitialiser les données</button>
      @if (done()) { <p class="mt-3 text-sm font-semibold text-success">Données réinitialisées.</p> }
    </section>
  </div>
  `,
})
export class SettingsComponent {
  readonly c = COMPANY;
  readonly markets = MARKETS;
  readonly network = SOURCING_NETWORK;
  readonly auth = inject(AuthService);
  private store = inject(StoreService);
  readonly done = signal(false);
  reset() { if (confirm('Réinitialiser toutes les données de démonstration ?')) { this.store.resetDemo(); this.done.set(true); } }
}
