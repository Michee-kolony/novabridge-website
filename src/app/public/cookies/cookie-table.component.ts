import { Component, Input } from '@angular/core';
import { CookieDefinition } from '../../core/cookies/cookie.config';

/** Liste des cookies d'une catégorie (panneau de préférences et page /cookies). */
@Component({
  selector: 'nb-cookie-table',
  standalone: false,
  template: `
  @if (cookies.length) {
    <div class="overflow-x-auto rounded-lg border border-mist">
      <table class="w-full min-w-[520px] text-left text-xs">
        <thead class="bg-ivory text-navy">
          <tr>
            <th class="px-3 py-2 font-semibold">{{ 'cookies.table.name' | translate }}</th>
            <th class="px-3 py-2 font-semibold">{{ 'cookies.table.provider' | translate }}</th>
            <th class="px-3 py-2 font-semibold">{{ 'cookies.table.storage' | translate }}</th>
            <th class="px-3 py-2 font-semibold">{{ 'cookies.table.duration' | translate }}</th>
            <th class="px-3 py-2 font-semibold">{{ 'cookies.table.purpose' | translate }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-mist">
          @for (c of cookies; track c.name) {
            <tr>
              <td class="px-3 py-2 font-mono text-navy">{{ c.name }}</td>
              <td class="px-3 py-2">{{ c.provider }}</td>
              <td class="px-3 py-2">{{ 'cookies.storage.' + c.storage | translate }}</td>
              <td class="px-3 py-2 whitespace-nowrap">
                @if (c.duration === 'session' || c.duration === 'persistent') { {{ 'cookies.duration.' + c.duration | translate }} }
                @else { {{ 'cookies.duration.' + c.duration.unit | translate: { n: c.duration.value } }} }
              </td>
              <td class="px-3 py-2">{{ 'cookies.purposes.' + c.purpose | translate }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  } @else {
    <p class="rounded-lg bg-ivory px-4 py-3 text-xs text-steel">{{ 'cookies.settings.none' | translate }}</p>
  }
  `,
})
export class CookieTableComponent {
  @Input({ required: true }) cookies: CookieDefinition[] = [];
}
