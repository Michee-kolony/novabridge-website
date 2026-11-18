import { AfterViewInit, Component, ElementRef, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { img } from '../core/data/company';
import { AuthService, DEMO_CREDENTIALS } from '../core/services/auth.service';
import { prefersReducedMotion } from '../shared/gsap.directives';

@Component({
  selector: 'nb-admin-login',
  standalone: false,
  template: `
  <div class="grid min-h-screen lg:grid-cols-2">
    <div class="relative hidden overflow-hidden bg-navy lg:block">
      <img [src]="img('photo-1494412574643-ff11b0a5c1c3', 1400)" alt="" class="absolute inset-0 h-full w-full object-cover opacity-30">
      <div class="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/30"></div>
      <div class="relative flex h-full flex-col justify-between p-14">
        <img src="logos/logo-horizontal-negatif-transparent.svg" alt="NovaBridge" class="h-14 w-auto self-start">
        <div>
          <p class="overline !text-gold">Back-office</p>
          <h1 class="mt-3 font-display text-4xl font-extrabold text-white">Gérez les devis, les annonces et le catalogue.</h1>
          <p class="mt-4 text-[#C9D3E0]">Espace réservé aux administrateurs de NovaBridge Global Supply LLC.</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center bg-cloud p-6">
      <form class="login-card w-full max-w-md rounded-2xl bg-white p-10 shadow-nb-lg" (ngSubmit)="submit()">
        <img src="logos/logo-horizontal-couleur.svg" alt="NovaBridge" class="mb-8 h-12 w-auto lg:hidden">
        <h2 class="font-display text-2xl font-extrabold text-navy">Connexion</h2>
        <p class="mt-1 text-sm text-steel">Accédez à l'espace d'administration.</p>

        <label class="field mt-8"><span>Adresse e-mail</span><input class="input" type="email" name="email" [(ngModel)]="email" autocomplete="username" required></label>
        <label class="field mt-5"><span>Mot de passe</span><input class="input" type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required></label>

        @if (error()) { <p class="mt-5 rounded-lg bg-red-50 p-3 text-sm font-medium text-danger" role="alert">Identifiants incorrects.</p> }
        <button type="submit" class="btn btn-primary mt-8 w-full justify-center">Se connecter</button>

        <div class="mt-8 rounded-lg border border-dashed border-gold bg-ivory p-4 text-xs text-slate">
          <p class="font-bold text-navy">Mode démonstration (site statique)</p>
          <p class="mt-1">E-mail : <code class="font-semibold">{{ demo.email }}</code><br>Mot de passe : <code class="font-semibold">{{ demo.password }}</code></p>
          <button type="button" class="mt-2 font-semibold text-atlantic underline" (click)="fill()">Remplir automatiquement</button>
        </div>
        <a routerLink="/" class="mt-6 block text-center text-sm font-semibold text-steel hover:text-navy">← Retour au site</a>
      </form>
    </div>
  </div>`,
})
export class AdminLoginComponent implements AfterViewInit {
  readonly redirect = input<string>('');
  private auth = inject(AuthService);
  private router = inject(Router);
  private el = inject(ElementRef<HTMLElement>);
  readonly demo = DEMO_CREDENTIALS;
  readonly img = img;
  readonly error = signal(false);
  email = '';
  password = '';

  ngAfterViewInit() {
    if (!prefersReducedMotion()) gsap.from(this.el.nativeElement.querySelector('.login-card'), { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
  }

  fill() { this.email = this.demo.email; this.password = this.demo.password; }

  submit() {
    if (this.auth.login(this.email, this.password)) {
      this.router.navigateByUrl(this.redirect() || '/admin');
    } else {
      this.error.set(true);
    }
  }
}
