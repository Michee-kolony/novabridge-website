import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CountUpDirective, ParallaxDirective, RevealDirective } from './gsap.directives';
import { IconComponent } from './icon.component';
import { LanguageSwitcherComponent } from './language-switcher.component';

const DECLARATIONS = [IconComponent, RevealDirective, CountUpDirective, ParallaxDirective, LanguageSwitcherComponent];

/**
 * Éléments communs au site client et au back-office.
 * Ré-exporte CommonModule, RouterModule et TranslateModule pour les modules qui l'importent.
 */
@NgModule({
  declarations: DECLARATIONS,
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [...DECLARATIONS, CommonModule, RouterModule, TranslateModule],
})
export class SharedModule {}
