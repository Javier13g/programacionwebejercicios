import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor JWT.
 *
 * Adjunta el header `Authorization: Bearer <token>` a TODAS las
 * peticiones salientes hacia APIs externas si el usuario está
 * autenticado. Para la RAWG API pública (key en query string),
 * NO adjuntamos Bearer porque ya viaja por `?key=`.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.obtenerToken();

  // No añadir Authorization a la API pública de RAWG (no usa Bearer)
  if (req.url.includes('api.rawg.io')) {
    return next(req);
  }

  if (!token) {
    return next(req);
  }

  const reqConToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(reqConToken);
};
