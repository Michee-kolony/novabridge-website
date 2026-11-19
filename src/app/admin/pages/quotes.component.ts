import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { COMPANY } from '../../core/data/company';
import { QuoteStatus, STATUS_LABELS } from '../../core/models';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-admin-quotes',
  standalone: false,
  template: `
  <h1 class="admin-title">Demandes de devis</h1>
  <p class="text-sm text-steel">Demandes envoyées depuis le formulaire « Get a free quote » du site.</p>

  <!-- Filtres : défilement horizontal sur mobile, retour à la ligne sur grand écran -->
  <div class="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:px-0">
    <button class="chip shrink-0" [class.chip-active]="status() === 'all'" (click)="status.set('all')">Toutes ({{ store.quotes().length }})</button>
    @for (s of statuses; track s) {
      <button class="chip shrink-0" [class.chip-active]="status() === s" (click)="status.set(s)">{{ labels[s] }} ({{ count(s) }})</button>
    }
  </div>

  <div class="admin-card mt-5 !p-4 sm:mt-6 sm:!p-6">
    <div class="relative w-full sm:max-w-sm">
      <nb-icon name="search" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
      <input class="input !pl-10" placeholder="Rechercher (client, produit, pays, n°)…" [ngModel]="query()" (ngModelChange)="query.set($event)">
    </div>
    <!-- Mobile / tablette : cartes -->
    <ul class="mt-4 space-y-3 xl:hidden">
      @for (q of filtered(); track q.id) {
        <li>
          <a [routerLink]="['/admin/devis', q.id]" class="block rounded-xl border border-mist p-4 transition hover:border-navy hover:shadow-nb-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-xs font-semibold text-steel">{{ q.id }} · {{ q.createdAt | date: 'dd/MM/yyyy HH:mm' }}</div>
                <div class="mt-0.5 truncate font-semibold text-navy">{{ q.company }}</div>
                <div class="truncate text-xs text-steel">{{ q.name }} · {{ q.country }}</div>
              </div>
              <nb-status [status]="q.status" />
            </div>
            <div class="mt-3 text-sm text-navy"><span class="text-steel">{{ q.productLine }} —</span> {{ q.product }}</div>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span class="font-bold text-navy">{{ q.quantity | number: '1.0-0' : 'fr' }} unités</span>
              @if (q.branding) { <span class="badge !text-[11px]">Logo</span> }
              @if (q.delivery === 'express') { <span class="badge !bg-cloud !text-[11px]">Express</span> }
            </div>
          </a>
        </li>
      } @empty {
        <li class="py-10 text-center text-steel">Aucune demande ne correspond.</li>
      }
    </ul>

    <!-- Grand écran : tableau -->
    <div class="mt-5 hidden overflow-x-auto xl:block">
      <table class="admin-table">
        <thead><tr><th>N°</th><th>Client</th><th>Gamme / produit</th><th class="text-right">Qté</th><th>Options</th><th>Statut</th><th>Reçue le</th></tr></thead>
        <tbody>
          @for (q of filtered(); track q.id) {
            <tr class="cursor-pointer" [routerLink]="['/admin/devis', q.id]">
              <td class="whitespace-nowrap font-semibold text-navy">{{ q.id }}</td>
              <td><div class="font-medium text-navy">{{ q.company }}</div><div class="text-xs text-steel">{{ q.name }} · {{ q.country }}</div></td>
              <td><div class="text-xs text-steel">{{ q.productLine }}</div><div>{{ q.product }}</div></td>
              <td class="text-right">{{ q.quantity | number: '1.0-0' : 'fr' }}</td>
              <td class="text-xs">@if (q.branding) { <span class="badge !text-[11px]">Logo</span> } @if (q.delivery === 'express') { <span class="badge !bg-cloud !text-[11px]">Express</span> }</td>
              <td><nb-status [status]="q.status" /></td>
              <td class="whitespace-nowrap text-steel">{{ q.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="py-10 text-center text-steel">Aucune demande ne correspond.</td></tr>
          }
        </tbody>
      </table>
    </div>
  </div>
  `,
})
export class QuotesComponent {
  readonly store = inject(StoreService);
  readonly labels = STATUS_LABELS;
  readonly statuses = Object.keys(STATUS_LABELS) as QuoteStatus[];
  readonly status = signal<QuoteStatus | 'all'>('all');
  readonly query = signal('');
  count(s: QuoteStatus) { return this.store.quotes().filter(q => q.status === s).length; }
  readonly filtered = computed(() => {
    const t = this.query().toLowerCase().trim();
    return this.store.quotes().filter(q =>
      (this.status() === 'all' || q.status === this.status()) &&
      (!t || [q.id, q.company, q.name, q.product, q.productLine, q.country, q.email].join(' ').toLowerCase().includes(t)));
  });
}

@Component({
  selector: 'nb-admin-quote-detail',
  standalone: false,
  template: `
  @if (quote(); as q) {
    <a routerLink="/admin/devis" class="text-sm font-semibold text-steel hover:text-navy">← Demandes de devis</a>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3"><h1 class="admin-title">Demande {{ q.id }}</h1><nb-status [status]="q.status" /></div>
      <div class="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
        <a class="btn btn-gold justify-center !px-4" [href]="replyLink()"><nb-icon name="mail" class="h-5 w-5" /><span class="sm:hidden">Répondre</span><span class="hidden sm:inline">Répondre par e-mail</span></a>
        <button class="btn btn-outline justify-center !border-danger !px-4 !text-danger hover:!bg-danger hover:!text-white" (click)="remove()"><nb-icon name="trash" class="h-5 w-5" />Supprimer</button>
      </div>
    </div>
    @if (q.demo) { <p class="mt-3 text-xs font-semibold text-gold-deep">Donnée de démonstration</p> }

    <div class="mt-6 grid gap-4 sm:mt-8 sm:gap-6 xl:grid-cols-3 [&>*]:min-w-0">
      <section class="admin-card xl:col-span-2">
        <h2 class="admin-h2">Détails de la demande</h2>
        <dl class="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div><dt class="dt">Gamme</dt><dd class="dd">{{ q.productLine }}</dd></div>
          <div><dt class="dt">Quantité</dt><dd class="dd">{{ q.quantity | number: '1.0-0' : 'fr' }} unités</dd></div>
          <div class="sm:col-span-2"><dt class="dt">Produit & spécifications</dt><dd class="dd">{{ q.product }}</dd></div>
          <div><dt class="dt">Personnalisation (logo)</dt><dd class="dd">{{ q.branding ? 'Oui' : 'Non' }}</dd></div>
          <div><dt class="dt">Livraison</dt><dd class="dd">{{ q.delivery === 'express' ? 'Express (DHL / FedEx)' : 'Standard (maritime / DDP)' }}</dd></div>
          <div class="sm:col-span-2"><dt class="dt">Message</dt><dd class="dd whitespace-pre-line">{{ q.message || '—' }}</dd></div>
          <div><dt class="dt">Reçue le</dt><dd class="dd">{{ q.createdAt | date: 'dd/MM/yyyy à HH:mm' }}</dd></div>
        </dl>

        <h2 class="admin-h2 mt-10">Notes internes</h2>
        <ul class="mt-4 space-y-2">
          @for (n of q.notes; track $index) { <li class="rounded-lg bg-ivory p-3 text-sm">{{ n }}</li> } @empty { <li class="text-sm text-steel">Aucune note.</li> }
        </ul>
        <form class="mt-4 flex flex-col gap-3 sm:flex-row" (ngSubmit)="addNote()">
          <input class="input" name="note" [(ngModel)]="note" placeholder="Ajouter une note (prix fournisseur, relance…)">
          <button class="btn btn-primary shrink-0 justify-center" type="submit">Ajouter</button>
        </form>
      </section>

      <div class="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-1 xl:content-start [&>*]:min-w-0">
        <section class="admin-card">
          <h2 class="admin-h2">Client</h2>
          <div class="mt-4 space-y-2 text-sm">
            <div class="font-display text-lg font-bold text-navy">{{ q.company }}</div>
            <div>{{ q.name }}</div>
            <a class="block break-all font-semibold text-atlantic" [href]="'mailto:' + q.email">{{ q.email }}</a>
            @if (q.phone) { <div>{{ q.phone }}</div> }
            <div class="flex items-center gap-2 text-steel"><nb-icon name="pin" class="h-4 w-4" />{{ q.country }}</div>
          </div>
        </section>
        <section class="admin-card">
          <h2 class="admin-h2">Changer le statut</h2>
          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1">
            @for (s of statuses; track s) {
              <button class="rounded-lg border px-4 py-2.5 text-left text-sm font-semibold transition"
                      [class]="q.status === s ? 'border-navy bg-navy text-white' : 'border-mist text-navy hover:border-navy'"
                      (click)="store.setQuoteStatus(q.id, s)">{{ labels[s] }}</button>
            }
          </div>
        </section>
      </div>
    </div>
  } @else {
    <p class="text-steel">Demande introuvable. <a routerLink="/admin/devis" class="font-semibold text-atlantic">Retour</a></p>
  }
  `,
})
export class QuoteDetailComponent {
  readonly id = input<string>('');
  readonly store = inject(StoreService);
  private router = inject(Router);
  readonly labels = STATUS_LABELS;
  readonly statuses = Object.keys(STATUS_LABELS) as QuoteStatus[];
  readonly quote = computed(() => this.store.quotes().find(q => q.id === this.id()));
  note = '';

  replyLink() {
    const q = this.quote()!;
    const subject = encodeURIComponent(`Your NovaBridge quote ${q.id} — ${q.product}`);
    const body = encodeURIComponent(`Dear ${q.name},\n\nThank you for your request for ${q.quantity} × ${q.product}.\nPlease find our detailed quote below.\n\nBest regards,\nNovaBridge Global Supply LLC\n${COMPANY.email}`);
    return `mailto:${q.email}?subject=${subject}&body=${body}`;
  }
  addNote() {
    if (!this.note.trim()) return;
    this.store.addQuoteNote(this.id(), this.note.trim());
    this.note = '';
  }
  remove() {
    if (confirm('Supprimer définitivement cette demande ?')) { this.store.deleteQuote(this.id()); this.router.navigateByUrl('/admin/devis'); }
  }
}
