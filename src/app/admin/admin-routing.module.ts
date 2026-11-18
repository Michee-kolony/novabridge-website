import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../core/services/auth.service';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminLoginComponent } from './admin-login.component';
import { AnnouncementEditComponent, AnnouncementsComponent } from './pages/announcements.component';
import { DashboardComponent } from './pages/dashboard.component';
import { MessagesComponent } from './pages/messages.component';
import { ProductsAdminComponent } from './pages/products-admin.component';
import { QuoteDetailComponent, QuotesComponent } from './pages/quotes.component';
import { SettingsComponent } from './pages/settings.component';

// Routes relatives à /admin
const routes: Routes = [
  { path: 'login', title: 'Connexion — Back-office NovaBridge', component: AdminLoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', title: 'Tableau de bord — NovaBridge', component: DashboardComponent },
      { path: 'devis', title: 'Demandes de devis — NovaBridge', component: QuotesComponent },
      { path: 'devis/:id', title: 'Demande de devis — NovaBridge', component: QuoteDetailComponent },
      { path: 'messages', title: 'Messages — NovaBridge', component: MessagesComponent },
      { path: 'annonces', title: 'Annonces — NovaBridge', component: AnnouncementsComponent },
      { path: 'annonces/nouvelle', title: 'Nouvelle annonce — NovaBridge', component: AnnouncementEditComponent },
      { path: 'annonces/:id', title: 'Modifier l’annonce — NovaBridge', component: AnnouncementEditComponent },
      { path: 'produits', title: 'Catalogue — NovaBridge', component: ProductsAdminComponent },
      { path: 'parametres', title: 'Paramètres — NovaBridge', component: SettingsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
