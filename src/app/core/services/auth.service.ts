import { Injectable, computed, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const KEY = 'novabridge-admin-session';

/** Identifiants de démonstration — à remplacer par une vraie authentification côté serveur. */
export const DEMO_CREDENTIALS = { email: 'admin@novabridge.local', password: 'NovaBridge2026' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<string | null>(sessionStorage.getItem(KEY));
  readonly isLoggedIn = computed(() => !!this.user());
  readonly email = computed(() => this.user());

  login(email: string, password: string): boolean {
    if (email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      sessionStorage.setItem(KEY, email);
      this.user.set(email);
      return true;
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem(KEY);
    this.user.set(null);
  }
}

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/admin/login'], { queryParams: { redirect: state.url } });
};
