import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.cerrarSesion();
          router.navigate(['/login'], {
            queryParams: { redirect: router.url, expirado: 1 },
          });
          break;
        case 403:
          router.navigate(['/'], { queryParams: { error: 'sin-permiso' } });
          break;
        case 404:
          router.navigate(['/404']);
          break;
        case 0:
          console.error('[HTTP] Error de red:', error.message);
          break;
        default:
          if (error.status >= 500) {
            console.error('[HTTP] Error del servidor:', error);
          }
      }
      return throwError(() => error);
    }),
  );
};
