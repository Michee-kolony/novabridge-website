import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { PageHeroComponent } from './page-hero.component';
import { PublicLayoutComponent } from './public-layout.component';
import { AboutComponent } from './pages/about.component';
import { ContactComponent } from './pages/contact.component';
import { HomeComponent } from './pages/home.component';
import { HowItWorksComponent } from './pages/how-it-works.component';
import { MarketsComponent } from './pages/markets.component';
import { NewsComponent, NewsDetailComponent } from './pages/news.component';
import { NotFoundComponent } from './pages/not-found.component';
import { ProductDetailComponent } from './pages/product-detail.component';
import { ProductsComponent } from './pages/products.component';
import { QuoteComponent } from './pages/quote.component';
import { BackToTopComponent } from './back-to-top.component';
import { CookieBannerComponent } from './cookies/cookie-banner.component';
import { CookiePolicyComponent } from './cookies/cookie-policy.component';
import { CookieSettingsComponent } from './cookies/cookie-settings.component';
import { CookieTableComponent } from './cookies/cookie-table.component';
import { FaqAccordionComponent } from './faq/faq-accordion.component';
import { FaqPageComponent } from './faq/faq-page.component';

/** Site client (chargé à la demande). */
@NgModule({
  declarations: [
    PublicLayoutComponent,
    PageHeroComponent,
    HomeComponent,
    ProductsComponent,
    ProductDetailComponent,
    MarketsComponent,
    HowItWorksComponent,
    AboutComponent,
    NewsComponent,
    NewsDetailComponent,
    QuoteComponent,
    ContactComponent,
    NotFoundComponent,
    // Retour en haut + cookies
    BackToTopComponent,
    CookieBannerComponent,
    CookieSettingsComponent,
    CookieTableComponent,
    CookiePolicyComponent,
    // FAQ
    FaqAccordionComponent,
    FaqPageComponent,
  ],
  imports: [SharedModule, ReactiveFormsModule, PublicRoutingModule],
})
export class PublicModule {}
