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

  <div class="mt-6 flex flex-wrap gap-2">
    <button class="chip" [class.chip-active]="status() === 'all'" (click)="status.set('all')">Toutes ({{ store.quotes().length }})</button>
    @for (s of statuses; track s) {
      <button class="chip" [class.chip-active]="status() === s" (click)="status.set(s)">{{ labels[s] }} ({{ count(s) }})</button>
    }
  </div>

  <div class="admin-card mt-6">
    <div class="relative max-w-sm">
      <nb-icon name="search" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
      <input class="input !pl-10" placeholder="Rechercher (client, produit, pays, n°)…" [ngModel]="query()" (ngModelChange)="query.set($event)">
    </div>
    <div class="mt-5 overflow-x-auto">
      <table class="admin-table">
        <thead><tr><th>N°</th><th>Client</th><th>Gamme / produit</th><th class="text-right">Qté</th><th>Options</th><th>Statut</th><th>Reçue le</th></tr></thead>
        <tbody>
          @for (q of filtered(); track q.id) {
            <tr class="cursor-pointer" [routerLink]="['/admin/devis', q.id]">
              <td class="whitespace-nowrap font-semibold text-navy">{{ q.id }}</td>
              <td><div class="font-medium text-navy">{{ q.company }}</div><div class="text-xs text-steel">{{ q.name }} · {{ q.country }}</div></td>
              <td><div class="text-xs text-steel">{{ q.productLine }}</div><div>{{ q.product }}</div></td>
              <td class="text-right">{{ q.quantity | number }}</td>
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
      <div class="flex items-center gap-4"><h1 class="admin-title">Demande {{ q.id }}</h1><nb-status [status]="q.status" /></div>
      <div class="flex gap-3">
        <a class="btn btn-gold" [href]="replyLink()"><nb-icon name="mail" class="h-5 w-5" />Répondre par e-mail</a>
        <button class="btn btn-outline !border-danger !text-danger hover:!bg-danger hover:!text-white" (click)="remove()"><nb-icon name="trash" class="h-5 w-5" />Supprimer</button>
      </div>
    </div>
    @if (q.demo) { <p class="mt-3 text-xs font-semibold text-gold-deep">Donnée de démonstration</p> }

    <div class="mt-8 grid gap-6 xl:grid-cols-3">
      <section class="admin-card xl:col-span-2">
        <h2 class="admin-h2">Détails de la demande</h2>
        <dl class="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div><dt class="dt">Gamme</dt><dd class="dd">{{ q.productLine }}</dd></div>
          <div><dt class="dt">Quantité</dt><dd class="dd">{{ q.quantity | number }} unités</dd></div>
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
        <form class="mt-4 flex gap-3" (ngSubmit)="addNote()">
          <input class="input" name="note" [(ngModel)]="note" placeholder="Ajouter une note (prix fournisseur, relance…)">
          <button class="btn btn-primary shrink-0" type="submit">Ajouter</button>
        </form>
      </section>

      <div class="space-y-6">
        <section class="admin-card">
          <h2 class="admin-h2">Client</h2>
          <div class="mt-4 space-y-2 text-sm">
            <div class="font-display text-lg font-bold text-navy">{{ q.company }}</div>
            <div>{{ q.name }}</div>
            <a class="block font-semibold text-atlantic" [href]="'mailto:' + q.email">{{ q.email }}</a>
            @if (q.phone) { <div>{{ q.phone }}</div> }
            <div class="flex items-center gap-2 text-steel"><nb-icon name="pin" class="h-4 w-4" />{{ q.country }}</div>
          </div>
        </section>
        <section class="admin-card">
          <h2 class="admin-h2">Changer le statut</h2>
          <div class="mt-4 grid gap-2">
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
