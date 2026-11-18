import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { img } from '../../core/data/company';
import { Announcement } from '../../core/models';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'nb-admin-announcements',
  standalone: false,
  template: `
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div><h1 class="admin-title">Annonces</h1><p class="text-sm text-steel">Les annonces publiées apparaissent sur la page « News » et l'accueil du site.</p></div>
    <a routerLink="/admin/annonces/nouvelle" class="btn btn-primary"><nb-icon name="plus" class="h-5 w-5" />Nouvelle annonce</a>
  </div>

  <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    @for (a of store.announcements(); track a.id) {
      <article class="flex flex-col overflow-hidden rounded-xl border border-mist bg-white shadow-nb-sm">
        <div class="relative h-40">
          <img [src]="img(a.image, 600, 320)" [alt]="a.title" class="h-full w-full object-cover" [class.grayscale]="!a.published">
          <span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold" [class]="a.published ? 'bg-success text-white' : 'bg-white text-slate'">{{ a.published ? 'Publiée' : 'Brouillon' }}</span>
          @if (a.featured) { <span class="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-navy">À la une</span> }
        </div>
        <div class="flex flex-1 flex-col p-5">
          <div class="text-xs text-steel">{{ a.category }} · {{ a.date | date: 'dd/MM/yyyy' }}</div>
          <h2 class="mt-1 font-display font-bold text-navy">{{ a.title }}</h2>
          <p class="mt-2 line-clamp-2 flex-1 text-sm text-steel">{{ a.excerpt }}</p>
          <div class="mt-4 flex items-center gap-2 border-t border-mist pt-4">
            <a [routerLink]="['/admin/annonces', a.id]" class="btn btn-outline !px-3 !py-2 text-sm"><nb-icon name="edit" class="h-4 w-4" />Modifier</a>
            <button class="btn !px-3 !py-2 text-sm" [class]="a.published ? 'btn-outline' : 'btn-gold'" (click)="store.togglePublished(a.id)">{{ a.published ? 'Dépublier' : 'Publier' }}</button>
            @if (a.published) { <a [routerLink]="['/news', a.id]" target="_blank" class="ml-auto p-2 text-steel hover:text-navy" title="Voir sur le site"><nb-icon name="eye" class="h-5 w-5" /></a> }
            <button class="p-2 text-steel hover:text-danger" [class.ml-auto]="!a.published" title="Supprimer" (click)="remove(a)"><nb-icon name="trash" class="h-5 w-5" /></button>
          </div>
        </div>
      </article>
    } @empty { <p class="text-steel">Aucune annonce. Créez la première !</p> }
  </div>
  `,
})
export class AnnouncementsComponent {
  readonly store = inject(StoreService);
  readonly img = img;
  remove(a: Announcement) { if (confirm(`Supprimer « ${a.title} » ?`)) this.store.deleteAnnouncement(a.id); }
}

/** Images proposées dans l'éditeur (toutes hébergées sur Unsplash). */
const IMAGE_CHOICES = [
  'photo-1600880292203-757bb62b4baf', 'photo-1578575437130-527eed3abbec', 'photo-1494412574643-ff11b0a5c1c3',
  'photo-1553413077-190dd305871c', 'photo-1541888946425-d81bb19240f5', 'photo-1582750433449-648ed127bb54',
  'photo-1618354691373-d851c5c3a990', 'photo-1549465220-1a8b9238cd48', 'photo-1601584115197-04ecc0da31d7',
  'photo-1605745341112-85968b19335b', 'photo-1504307651254-35680f356dfd', 'photo-1489987707025-afc232f7ea0f',
];

@Component({
  selector: 'nb-admin-announcement-edit',
  standalone: false,
  template: `
  <a routerLink="/admin/annonces" class="text-sm font-semibold text-steel hover:text-navy">← Annonces</a>
  <h1 class="admin-title mt-3">{{ id() ? 'Modifier l’annonce' : 'Nouvelle annonce' }}</h1>

  <form [formGroup]="form" (ngSubmit)="save()" class="mt-8 grid gap-6 xl:grid-cols-3" novalidate>
    <section class="admin-card space-y-5 xl:col-span-2">
      <label class="field"><span>Titre *</span><input class="input" formControlName="title" placeholder="Ex. New production run of safety boots"></label>
      <label class="field"><span>Résumé * <em class="font-normal text-steel">(affiché sur les cartes)</em></span><textarea class="input min-h-[80px]" formControlName="excerpt"></textarea></label>
      <label class="field"><span>Contenu *</span><textarea class="input min-h-[220px]" formControlName="content" placeholder="Un paragraphe par ligne."></textarea></label>
      <p class="text-xs text-steel">Le site client est en anglais : rédigez de préférence l’annonce en anglais.</p>

      <div>
        <span class="text-sm font-semibold text-navy">Image</span>
        <div class="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          @for (c of choices; track c) {
            <button type="button" class="overflow-hidden rounded-lg ring-offset-2 transition" [class]="form.value.image === c ? 'ring-4 ring-gold' : 'opacity-80 hover:opacity-100'" (click)="form.patchValue({ image: c })">
              <img [src]="img(c, 240, 160)" alt="" class="aspect-[3/2] w-full object-cover">
            </button>
          }
        </div>
        <label class="field mt-3"><span class="!text-xs">…ou identifiant / URL Unsplash</span><input class="input" formControlName="image"></label>
      </div>
    </section>

    <aside class="space-y-6">
      <section class="admin-card space-y-5">
        <h2 class="admin-h2">Publication</h2>
        <label class="field"><span>Catégorie</span>
          <select class="input" formControlName="category">@for (c of categories; track c) { <option [value]="c">{{ c }}</option> }</select>
        </label>
        <label class="field"><span>Date</span><input class="input" type="date" formControlName="date"></label>
        <label class="choice"><input type="checkbox" formControlName="published"> Publier sur le site</label>
        <label class="choice"><input type="checkbox" formControlName="featured"> Mettre à la une</label>
        @if (error()) { <p class="rounded-lg bg-red-50 p-3 text-sm text-danger">Titre, résumé et contenu sont obligatoires.</p> }
        <button type="submit" class="btn btn-primary w-full justify-center">Enregistrer</button>
      </section>
      <section class="admin-card">
        <h2 class="admin-h2">Aperçu</h2>
        <div class="mt-4 overflow-hidden rounded-xl border border-mist">
          <img [src]="img(form.value.image || choices[0], 600, 320)" alt="" class="h-36 w-full object-cover">
          <div class="p-4"><span class="badge">{{ form.value.category }}</span><h3 class="mt-2 font-display font-bold text-navy">{{ form.value.title || 'Titre de l’annonce' }}</h3><p class="mt-1 line-clamp-2 text-sm text-steel">{{ form.value.excerpt }}</p></div>
        </div>
      </section>
    </aside>
  </form>
  `,
})
export class AnnouncementEditComponent implements OnInit {
  readonly id = input<string>('');
  private store = inject(StoreService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly img = (src: string, w: number, h: number) => (src.startsWith('http') ? src : img(src, w, h));
  readonly choices = IMAGE_CHOICES;
  readonly categories: Announcement['category'][] = ['News', 'Product', 'Logistics', 'Offer'];
  readonly error = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    excerpt: ['', Validators.required],
    content: ['', Validators.required],
    category: ['News' as Announcement['category']],
    image: [IMAGE_CHOICES[0]],
    date: [new Date().toISOString().slice(0, 10)],
    published: [true],
    featured: [false],
  });

  ngOnInit() {
    const a = this.id() ? this.store.announcement(this.id()) : undefined;
    if (a) this.form.patchValue({ ...a, date: a.date.slice(0, 10) });
  }

  save() {
    if (this.form.invalid) { this.error.set(true); return; }
    const v = this.form.getRawValue();
    this.store.saveAnnouncement({ ...v, id: this.id() || undefined, date: new Date(v.date + 'T12:00:00').toISOString() });
    this.router.navigateByUrl('/admin/annonces');
  }
}
