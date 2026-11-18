import { Component } from '@angular/core';

@Component({
  selector: 'nb-not-found',
  standalone: false,
  template: `
  <section class="flex min-h-[70vh] items-center bg-ivory">
    <div class="container-nb text-center">
      <img src="logos/symbole-couleur.svg" alt="" class="mx-auto h-24 w-24">
      <p class="overline mt-6">{{ 'notFound.kicker' | translate }}</p>
      <h1 class="h2 mt-3">{{ 'notFound.title' | translate }}</h1>
      <p class="mt-4 text-steel">{{ 'notFound.text' | translate }}</p>
      <a routerLink="/" class="btn btn-primary mt-8">{{ 'common.backHome' | translate }}</a>
    </div>
  </section>`,
})
export class NotFoundComponent {}
