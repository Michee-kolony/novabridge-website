import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * Traduit les titres d'onglet des routes du site client.
 * Un titre de route commençant par « titles. » est une clé de traduction ;
 * les autres (back-office) sont affichés tels quels.
 */
@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  private translate = inject(TranslateService);
  private last?: string;

  constructor() {
    super();
    this.translate.onLangChange.subscribe(() => this.apply());
  }

  override updateTitle(snapshot: RouterStateSnapshot) {
    this.last = this.buildTitle(snapshot);
    this.apply();
  }

  private apply() {
    if (!this.last) return;
    this.title.setTitle(this.last.startsWith('titles.') ? this.translate.instant(this.last) : this.last);
  }
}
