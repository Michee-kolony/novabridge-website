import { Component, computed, inject, signal } from '@angular/core';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-admin-messages',
  standalone: false,
  template: `
  <h1 class="admin-title">Messages</h1>
  <p class="text-sm text-steel">Messages envoyés depuis la page Contact du site.</p>

  <div class="mt-8 grid gap-6 lg:grid-cols-5">
    <ul class="admin-card !p-2 lg:col-span-2">
      @for (m of store.messages(); track m.id) {
        <li>
          <button class="w-full rounded-lg p-4 text-left transition" [class]="selectedId() === m.id ? 'bg-ivory' : 'hover:bg-cloud'" (click)="open(m.id)">
            <div class="flex items-center justify-between gap-2">
              <span class="truncate text-sm" [class]="m.read ? 'font-medium text-slate' : 'font-bold text-navy'">{{ m.name }}</span>
              <span class="shrink-0 text-xs text-steel">{{ m.createdAt | date: 'dd/MM HH:mm' }}</span>
            </div>
            <div class="mt-1 flex items-center gap-2 text-sm" [class.font-semibold]="!m.read">@if (!m.read) { <span class="h-2 w-2 shrink-0 rounded-full bg-gold"></span> }<span class="truncate">{{ m.subject }}</span></div>
          </button>
        </li>
      } @empty { <li class="p-6 text-sm text-steel">Aucun message.</li> }
    </ul>

    <section class="admin-card lg:col-span-3">
      @if (selected(); as m) {
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="font-display text-xl font-bold text-navy">{{ m.subject }}</h2>
            <p class="mt-1 text-sm text-steel">{{ m.name }} · <a [href]="'mailto:' + m.email" class="text-atlantic">{{ m.email }}</a> · {{ m.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
            @if (m.demo) { <p class="mt-1 text-xs font-semibold text-gold-deep">Donnée de démonstration</p> }
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline !px-3 !py-2 text-sm" (click)="store.markMessage(m.id, !m.read)">{{ m.read ? 'Marquer non lu' : 'Marquer lu' }}</button>
            <button class="btn btn-outline !border-danger !px-3 !py-2 !text-danger" (click)="remove(m.id)" aria-label="Supprimer"><nb-icon name="trash" class="h-4 w-4" /></button>
          </div>
        </div>
        <p class="mt-6 whitespace-pre-line rounded-lg bg-cloud p-5 leading-relaxed">{{ m.message }}</p>
        <a class="btn btn-primary mt-6" [href]="'mailto:' + m.email + '?subject=' + encode('Re: ' + m.subject)"><nb-icon name="mail" class="h-5 w-5" />Répondre</a>
      } @else {
        <div class="py-16 text-center text-steel"><nb-icon name="mail" class="mx-auto h-10 w-10" /><p class="mt-3">Sélectionnez un message.</p></div>
      }
    </section>
  </div>
  `,
})
export class MessagesComponent {
  readonly store = inject(StoreService);
  readonly selectedId = signal<string | null>(null);
  readonly selected = computed(() => this.store.messages().find(m => m.id === this.selectedId()));
  encode = encodeURIComponent;
  open(id: string) { this.selectedId.set(id); this.store.markMessage(id, true); }
  remove(id: string) { if (confirm('Supprimer ce message ?')) { this.store.deleteMessage(id); this.selectedId.set(null); } }
}
