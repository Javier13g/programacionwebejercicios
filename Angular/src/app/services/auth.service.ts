import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { UtilidadesService } from './utilidades.service';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'cliente' | 'admin';
  token: string;
}

const CLAVE_USUARIO = 'gamestore_usuario';

/**
 * Servicio de autenticación simulado (sin backend real).
 *
 * Persiste al usuario actual en `localStorage` y expone un
 * `BehaviorSubject` para que el resto de la app reaccione en
 * tiempo real a cambios de sesión.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly utils = inject(UtilidadesService);

  /** Usuario actual (signal para la UI reactiva). */
  private readonly _usuario = signal<Usuario | null>(this.cargarInicial());
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly esAdminSignal = computed(() => this._usuario()?.rol === 'admin');

  /** BehaviorSubject espejo del signal (para cumplir requisito RxJS). */
  private readonly usuario$ = new BehaviorSubject<Usuario | null>(this._usuario());

  /** Observable público para suscribirse. */
  readonly cambios$: Observable<Usuario | null> = this.usuario$.asObservable();

  // --- API pública ---

  estaAutenticado(): boolean {
    return this._usuario() !== null;
  }

  esAdmin(): boolean {
    return this._usuario()?.rol === 'admin';
  }

  obtenerToken(): string | null {
    return this._usuario()?.token ?? null;
  }

  /**
   * Login simulado: si el email es `admin@gamestore.do` y la
   * contraseña es `admin123`, el rol es `admin`. Cualquier otro
   * email con password no vacío entra como `cliente`.
   */
  login(email: string, password: string): Observable<Usuario> {
    const rol: 'cliente' | 'admin' =
      email === 'admin@gamestore.do' && password === 'admin123'
        ? 'admin'
        : 'cliente';
    const usuario: Usuario = {
      id: 'usr_' + Math.random().toString(36).slice(2, 10),
      nombre: email.split('@')[0],
      email,
      rol,
      token: 'jwt.' + btoa(email + ':' + Date.now()),
    };
    return of(usuario).pipe(
      delay(300),
      tap((u) => {
        this._usuario.set(u);
        this.usuario$.next(u);
        this.utils.guardar(CLAVE_USUARIO, u);
      }),
    );
  }

  logout$(): Observable<void> {
    return of(void 0).pipe(
      delay(100),
      tap(() => this.cerrarSesion()),
    );
  }

  cerrarSesion(): void {
    this._usuario.set(null);
    this.usuario$.next(null);
    this.utils.eliminar(CLAVE_USUARIO);
  }

  private cargarInicial(): Usuario | null {
    return this.utils.leer<Usuario>(CLAVE_USUARIO, null);
  }
}
