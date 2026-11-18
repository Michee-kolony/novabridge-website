import { APP_INITIALIZER, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TitleStrategy } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DEFAULT_LANG, LanguageService } from './core/services/language.service';
import { TranslatedTitleStrategy } from './core/services/translated-title.strategy';

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // Traductions : public/i18n/en.json (défaut), fr.json, es.json, zh.json
    TranslateModule.forRoot({
      defaultLanguage: DEFAULT_LANG,
      loader: { provide: TranslateLoader, useFactory: httpTranslateLoader, deps: [HttpClient] },
    }),
  ],
  providers: [
    provideHttpClient(),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    // Charge la langue avant le premier affichage (le splash screen reste visible pendant ce temps).
    { provide: APP_INITIALIZER, multi: true, useFactory: () => { const lang = inject(LanguageService); return () => lang.init(); } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
