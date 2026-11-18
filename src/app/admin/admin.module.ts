import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminLoginComponent } from './admin-login.component';
import { StatusBadgeComponent } from './status-badge.component';
import { AnnouncementEditComponent, AnnouncementsComponent } from './pages/announcements.component';
import { DashboardComponent } from './pages/dashboard.component';
import { MessagesComponent } from './pages/messages.component';
import { ProductsAdminComponent } from './pages/products-admin.component';
import { QuoteDetailComponent, QuotesComponent } from './pages/quotes.component';
import { SettingsComponent } from './pages/settings.component';

/** Back-office (chargé à la demande sous /admin). */
@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminLoginComponent,
    StatusBadgeComponent,
    DashboardComponent,
    QuotesComponent,
    QuoteDetailComponent,
    MessagesComponent,
    AnnouncementsComponent,
    AnnouncementEditComponent,
    ProductsAdminComponent,
    SettingsComponent,
  ],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, AdminRoutingModule],
})
export class AdminModule {}
