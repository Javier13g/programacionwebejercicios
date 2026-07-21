import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, Usuario } from '../models/empleado';
import { UsuarioRequest } from '../models/forms';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/usuarios';

  listar(page: number = 0, size: number = 20): Observable<PageResponse<Usuario>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Usuario>>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  crear(dto: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, dto);
  }

  actualizar(id: number, cambios: Partial<UsuarioRequest>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}`, cambios);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
