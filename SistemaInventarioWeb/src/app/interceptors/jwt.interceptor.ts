import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Lee el token DIRECTAMENTE de localStorage en cada request.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Log de diagnostico: muestra SIEMPRE que pasa por aca
  console.log('[JWT-INTERCEPTOR]', req.method, req.url);

  // No adjuntamos token al propio login
  if (req.url.includes('/login')) {
    console.log('[JWT-INTERCEPTOR] skip /login');
    return next(req);
  }

  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem('jwt_token');
  console.log(
    '[JWT-INTERCEPTOR] token from localStorage:',
    token ? `presente (${token.length} chars, empieza en ${token.substring(0, 20)}...)` : 'AUSENTE'
  );

  if (token && token.length > 0) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[JWT-INTERCEPTOR] header agregado:', cloned.headers.get('Authorization')?.substring(0, 30) + '...');
    return next(cloned);
  }

  console.warn('[JWT-INTERCEPTOR] no hay token, request sale SIN Authorization');
  return next(req);
};
