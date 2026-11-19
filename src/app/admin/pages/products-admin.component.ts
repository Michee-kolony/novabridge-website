import { Component, inject, signal } from '@angular/core';
import { img } from '../../core/data/company';
import { ProductLine } from '../../core/models';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-admin-products',
  standalone: false,
  template: `
  <h1 class="admin-title">Catalogue produits</h1>
  <p class="text-sm text-steel">Modifiez les gammes et les produits affichés sur le site.</p>

  <div class="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
    @for (p of store.products(); track p.slug) {
      <section class="admin-card">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <img [src]="img(p.image, 480, 320)" [alt]="p.name" class="aspect-[16/9] w-full rounded-lg object-cover sm:aspect-auto sm:h-24 sm:w-36 sm:shrink-0" [class.grayscale]="!p.visible">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="font-display text-lg font-bold text-navy sm:text-xl">{{ p.name }}</h2>
              <span class="rounded-full px-2.5 py-1 text-xs font-bold" [class]="p.visible ? 'bg-emerald-100 text-success' : 'bg-cloud text-steel'">{{ p.visible ? 'Visible' : 'Masquée' }}</span>
            </div>
            <p class="mt-1 text-sm text-steel">{{ p.short }} · Hub : {{ p.hub }}</p>
            <div class="mt-3 flex flex-wrap gap-2">@for (i of p.industries; track i) { <span class="badge !bg-cloud">{{ i }}</span> }</div>
          </div>
          <div class="flex flex-wrap gap-2 sm:shrink-0">
            <button class="btn btn-outline !px-3 !py-2 text-sm" (click)="toggleEdit(p)"><nb-icon name="edit" class="h-4 w-4" />{{ editing() === p.slug ? 'Fermer' : 'Modifier' }}</button>
            <button class="btn !px-3 !py-2 text-sm" [class]="p.visible ? 'btn-outline' : 'btn-gold'" (click)="store.updateProduct(p.slug, { visible: !p.visible })">{{ p.visible ? 'Masquer' : 'Afficher' }}</button>
            @if (p.visible) { <a [routerLink]="['/products', p.slug]" target="_blank" class="p-2 text-steel hover:text-navy" title="Voir sur le site"><nb-icon name="eye" class="h-5 w-5" /></a> }
          </div>
        </div>

        @if (editing() === p.slug) {
          <div class="mt-6 grid gap-5 border-t border-mist pt-6 lg:grid-cols-2">
            <label class="field"><span>Accroche</span><input class="input" [(ngModel)]="draft.short"></label>
            <label class="field"><span>Hub de production</span><input class="input" [(ngModel)]="draft.hub"></label>
            <label class="field lg:col-span-2"><span>Description</span><textarea class="input min-h-[90px]" [(ngModel)]="draft.description"></textarea></label>
            <div class="lg:col-span-2">
              <span class="text-sm font-semibold text-navy">Produits ({{ draft.items.length }})</span>
              <div class="mt-2 flex flex-wrap gap-2">
                @for (it of draft.items; track it; let i = $index) {
                  <span class="inline-flex items-center gap-2 rounded-full bg-ivory py-1.5 pl-3 pr-2 text-sm text-navy">{{ it }}
                    <button class="text-steel hover:text-danger" (click)="draft.items.splice(i, 1)" aria-label="Retirer"><nb-icon name="close" class="h-3.5 w-3.5" /></button></span>
                }
              </div>
              <form class="mt-3 flex w-full gap-2 sm:max-w-md" (ngSubmit)="addItem()"><input class="input" name="item" [(ngModel)]="newItem" placeholder="Ajouter un produit…"><button class="btn btn-outline shrink-0" type="submit">Ajouter</button></form>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:flex lg:col-span-2">
              <button class="btn btn-primary justify-center" (click)="save(p.slug)">Enregistrer</button>
              <button class="btn btn-outline justify-center" (click)="editing.set(null)">Annuler</button>
            </div>
          </div>
        }
      </section>
    }
  </div>
  `,
})
export class ProductsAdminComponent {
  readonly store = inject(StoreService);
  readonly img = img;
  readonly editing = signal<string | null>(null);
  draft: Pick<ProductLine, 'short' | 'hub' | 'description' | 'items'> = { short: '', hub: '', description: '', items: [] };
  newItem = '';

  toggleEdit(p: ProductLine) {
    if (this.editing() === p.slug) { this.editing.set(null); return; }
    this.draft = { short: p.short, hub: p.hub, description: p.description, items: [...p.items] };
    this.editing.set(p.slug);
  }
  addItem() { if (this.newItem.trim()) { this.draft.items.push(this.newItem.trim()); this.newItem = ''; } }
  save(slug: string) { this.store.updateProduct(slug, { ...this.draft, items: [...this.draft.items] }); this.editing.set(null); }
}
