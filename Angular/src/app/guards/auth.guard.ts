import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard `CanActivate` para rutas que requieren usuario autenticado
 * (ej. /checkout, /perfil, /historial, /admin).
 *
 * Si no hay sesión válida, redirige a `/login` preservando la URL
 * intentada en `?redirect=`.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};

export const authCanMatch: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaAutenticado()) return true;
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return true;
  return router.createUrlTree(['/'], { queryParams: { error: 'sin-permiso' } });
};
