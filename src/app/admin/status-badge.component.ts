import { Component, Input } from '@angular/core';
import { QuoteStatus, STATUS_LABELS } from '../core/models';

const STYLES: Record<QuoteStatus, string> = {
  nouveau: 'bg-gold-light text-navy',
  en_cours: 'bg-blue-100 text-atlantic',
  devis_envoye: 'bg-indigo-100 text-indigo-800',
  gagne: 'bg-emerald-100 text-success',
  perdu: 'bg-red-100 text-danger',
};

@Component({
  selector: 'nb-status',
  standalone: false,
  template: `<span class="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" [class]="styles[status]">{{ labels[status] }}</span>`,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: QuoteStatus;
  readonly labels = STATUS_LABELS;
  readonly styles = STYLES;
}
