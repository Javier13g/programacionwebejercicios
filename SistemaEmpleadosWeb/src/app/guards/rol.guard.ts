import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const userRol = auth.user()?.rol;


  if (!userRol) {
    return true;
  }

  if (allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(userRol)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
