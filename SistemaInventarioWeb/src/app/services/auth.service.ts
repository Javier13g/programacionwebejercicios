import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'jwt_token';

  private readonly _token = signal<string | null>(this.getStoredToken());
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/usuarios/login`, credentials)
      .pipe(
        tap((response) => {
          // Solo guardamos si el backend confirmo login exitoso y devolvio token.
          if (response?.success !== false && response?.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            this._token.set(response.token);
          } else {
            // Si success=false, aseguramos de limpiar cualquier token previo.
            localStorage.removeItem(this.TOKEN_KEY);
            this._token.set(null);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
