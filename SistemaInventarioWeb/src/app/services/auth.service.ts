import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioActual } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';

  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _currentUser = signal<UsuarioActual | null>(this.getStoredUser());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/usuarios/login`, credentials)
      .pipe(
        tap((response) => {
          if (response?.success !== false && response?.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            this._token.set(response.token);
            let user: UsuarioActual | null = null;
            if (response.id != null) {
              user = {
                id: response.id,
                username: response.username ?? credentials.username,
                rol: response.rol
              };
            } else {
              user = this.decodeTokenUser(response.token);
            }
            if (user) {
              localStorage.setItem(this.USER_KEY, JSON.stringify(user));
              this._currentUser.set(user);
            }
          } else {
            localStorage.removeItem(this.TOKEN_KEY);
            this._token.set(null);
            localStorage.removeItem(this.USER_KEY);
            this._currentUser.set(null);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UsuarioActual | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as UsuarioActual;
      } catch {
      }
    }
    const token = this.getStoredToken();
    if (token) {
      const decoded = this.decodeTokenUser(token);
      if (decoded) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(decoded));
        return decoded;
      }
    }
    return null;
  }

  private decodeTokenUser(token: string): UsuarioActual | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      // base64url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = JSON.parse(atob(padded));
      if (json.sub == null) return null;
      return {
        id: Number(json.sub),
        username: json.username,
        rol: json.rol
      };
    } catch {
      return null;
    }
  }
}
