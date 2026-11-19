import { AfterViewInit, Component, ElementRef, computed, inject } from '@angular/core';
import { gsap } from 'gsap';
import { STATUS_LABELS, QuoteStatus } from '../../core/models';
import { StoreService } from '../../core/services/store.service';
import { prefersReducedMotion } from '../../shared/gsap.directives';

@Component({
  selector: 'nb-admin-dashboard',
  standalone: false,
  template: `
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div><h1 class="admin-title">Tableau de bord</h1><p class="text-sm text-steel">Vue d'ensemble de l'activité commerciale.</p></div>
    <a routerLink="/admin/annonces/nouvelle" class="btn btn-primary w-full justify-center sm:w-auto"><nb-icon name="plus" class="h-5 w-5" />Nouvelle annonce</a>
  </div>

  <div class="kpis mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 xl:grid-cols-4">
    @for (k of kpis(); track k.label) {
      <a [routerLink]="k.link" class="min-w-0 rounded-xl border border-mist bg-white p-4 shadow-nb-sm transition hover:shadow-nb sm:p-6">
        <div class="flex items-start justify-between gap-2">
          <span class="text-xs font-semibold text-steel sm:text-sm">{{ k.label }}</span>
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ivory text-navy sm:h-10 sm:w-10"><nb-icon [name]="k.icon" class="h-5 w-5" /></span>
        </div>
        <div class="mt-2 font-display text-2xl font-extrabold text-navy sm:mt-3 sm:text-3xl">{{ k.value }}</div>
        <div class="mt-1 text-xs text-steel">{{ k.hint }}</div>
      </a>
    }
  </div>

  <div class="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
    <section class="admin-card md:col-span-2">
      <div class="flex items-center justify-between gap-3"><h2 class="admin-h2">Dernières demandes de devis</h2><a routerLink="/admin/devis" class="shrink-0 whitespace-nowrap text-sm font-semibold text-atlantic">Tout voir →</a></div>
      <ul class="mt-3 divide-y divide-mist">
        @for (q of store.quotes().slice(0, 6); track q.id) {
          <li>
            <a [routerLink]="['/admin/devis', q.id]" class="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-cloud">
              <div class="min-w-0">
                <div class="flex items-baseline gap-2"><span class="shrink-0 text-sm font-bold text-navy">{{ q.id }}</span><span class="truncate text-sm font-medium text-navy">{{ q.company }}</span></div>
                <div class="truncate text-xs text-steel">{{ q.product }} · {{ q.quantity | number: '1.0-0' : 'fr' }} u. · {{ q.country }}</div>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1"><nb-status [status]="q.status" /><span class="text-xs text-steel">{{ q.createdAt | date: 'dd/MM HH:mm' }}</span></div>
            </a>
          </li>
        }
      </ul>
    </section>

    <section class="admin-card">
      <h2 class="admin-h2">Pipeline commercial</h2>
      <div class="mt-5 space-y-4">
        @for (s of pipeline(); track s.key) {
          <div>
            <div class="flex justify-between text-sm"><span class="font-medium text-navy">{{ s.label }}</span><span class="text-steel">{{ s.count }}</span></div>
            <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cloud"><div class="bar h-full rounded-full" [style.width.%]="s.pct" [class]="s.color"></div></div>
          </div>
        }
      </div>
      <div class="mt-6 rounded-lg bg-ivory p-4 text-sm"><span class="font-bold text-navy">Taux de conversion : {{ conversion() }} %</span><br><span class="text-steel">devis gagnés / devis clôturés</span></div>
    </section>

    <section class="admin-card">
      <h2 class="admin-h2">Demandes par gamme</h2>
      <div class="mt-5 space-y-4">
        @for (l of byLine(); track l.name) {
          <div>
            <div class="flex justify-between text-sm"><span class="font-medium text-navy">{{ l.name }}</span><span class="text-steel">{{ l.count }}</span></div>
            <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cloud"><div class="bar h-full rounded-full bg-navy" [style.width.%]="l.pct"></div></div>
          </div>
        }
      </div>
    </section>

    <section class="admin-card">
      <h2 class="admin-h2">Demandes par pays</h2>
      <ul class="mt-4 divide-y divide-mist">
        @for (c of byCountry(); track c.name) {
          <li class="flex items-center justify-between py-2.5 text-sm"><span class="flex items-center gap-2 text-navy"><nb-icon name="pin" class="h-4 w-4" />{{ c.name }}</span><span class="font-semibold">{{ c.count }}</span></li>
        }
      </ul>
    </section>

    <section class="admin-card">
      <div class="flex items-center justify-between gap-3"><h2 class="admin-h2">Messages récents</h2><a routerLink="/admin/messages" class="shrink-0 whitespace-nowrap text-sm font-semibold text-atlantic">Tout voir →</a></div>
      <ul class="mt-4 space-y-3">
        @for (m of store.messages().slice(0, 4); track m.id) {
          <li class="rounded-lg border border-mist p-3">
            <div class="flex items-center justify-between gap-2 text-sm"><span class="truncate font-semibold text-navy">{{ m.subject }}</span>@if (!m.read) { <span class="h-2 w-2 rounded-full bg-gold"></span> }</div>
            <div class="truncate text-xs text-steel">{{ m.name }} — {{ m.message }}</div>
          </li>
        } @empty { <li class="text-sm text-steel">Aucun message.</li> }
      </ul>
    </section>
  </div>
  `,
})
export class DashboardComponent implements AfterViewInit {
  readonly store = inject(StoreService);
  private el = inject(ElementRef<HTMLElement>);

  readonly kpis = computed(() => {
    const q = this.store.quotes();
    const units = q.reduce((s, x) => s + x.quantity, 0);
    return [
      { label: 'Demandes de devis', value: q.length, hint: `${this.store.newQuotesCount()} nouvelle(s) à traiter`, icon: 'file', link: '/admin/devis' },
      { label: 'En cours', value: q.filter(x => x.status === 'en_cours' || x.status === 'devis_envoye').length, hint: 'en cours ou devis envoyé', icon: 'clock', link: '/admin/devis' },
      { label: 'Unités demandées', value: units.toLocaleString('fr-FR'), hint: 'toutes demandes confondues', icon: 'box', link: '/admin/devis' },
      { label: 'Annonces publiées', value: this.store.publishedAnnouncements().length, hint: `${this.store.announcements().length - this.store.publishedAnnouncements().length} brouillon(s)`, icon: 'megaphone', link: '/admin/annonces' },
    ];
  });

  readonly pipeline = computed(() => {
    const q = this.store.quotes();
    const colors: Record<QuoteStatus, string> = { nouveau: 'bg-gold', en_cours: 'bg-atlantic', devis_envoye: 'bg-indigo-500', gagne: 'bg-success', perdu: 'bg-danger' };
    return (Object.keys(STATUS_LABELS) as QuoteStatus[]).map(key => {
      const count = q.filter(x => x.status === key).length;
      return { key, label: STATUS_LABELS[key], count, pct: q.length ? (count / q.length) * 100 : 0, color: colors[key] };
    });
  });

  readonly conversion = computed(() => {
    const q = this.store.quotes();
    const won = q.filter(x => x.status === 'gagne').length, lost = q.filter(x => x.status === 'perdu').length;
    return won + lost ? Math.round((won / (won + lost)) * 100) : 0;
  });

  private group(key: 'productLine' | 'country') {
    const q = this.store.quotes();
    const map = new Map<string, number>();
    q.forEach(x => map.set(x[key], (map.get(x[key]) ?? 0) + 1));
    const max = Math.max(1, ...map.values());
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }
  readonly byLine = computed(() => this.group('productLine'));
  readonly byCountry = computed(() => this.group('country'));

  ngAfterViewInit() {
    if (prefersReducedMotion()) return;
    const root = this.el.nativeElement as HTMLElement;
    gsap.from(root.querySelectorAll('.kpis > a'), { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
    gsap.from(root.querySelectorAll('.bar'), { width: 0, duration: 1.1, stagger: 0.05, ease: 'power3.out', delay: 0.2 });
  }
}
