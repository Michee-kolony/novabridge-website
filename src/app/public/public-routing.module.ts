import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { CookiePolicyComponent } from './cookies/cookie-policy.component';
import { FaqPageComponent } from './faq/faq-page.component';

// Les titres sont des clés de traduction (voir public/i18n/*.json).
const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', title: 'titles.home', component: HomeComponent },
      { path: 'products', title: 'titles.products', component: ProductsComponent },
      { path: 'products/:slug', title: 'titles.productDetail', component: ProductDetailComponent },
      { path: 'markets', title: 'titles.markets', component: MarketsComponent },
      { path: 'how-it-works', title: 'titles.howItWorks', component: HowItWorksComponent },
      { path: 'about', title: 'titles.about', component: AboutComponent },
      { path: 'news', title: 'titles.news', component: NewsComponent },
      { path: 'news/:id', title: 'titles.news', component: NewsDetailComponent },
      { path: 'quote', title: 'titles.quote', component: QuoteComponent },
      { path: 'contact', title: 'titles.contact', component: ContactComponent },
      { path: 'faq', title: 'titles.faq', component: FaqPageComponent },
      { path: 'cookies', title: 'titles.cookies', component: CookiePolicyComponent },
      { path: '**', title: 'titles.notFound', component: NotFoundComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
