import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, Usuario } from '../models/empleado';
import { RolUsuario, UsuarioRequest } from '../models/forms';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.usuarios;

  listar(page: number = 0, size: number = 20, q?: string, rol?: RolUsuario | null, incluirDeshabilitados: boolean = false): Observable<PageResponse<Usuario>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const termino = q?.trim();
    if (termino) {
      params = params.set('q', termino);
    }
    if (rol) {
      params = params.set('rol', rol);
    }
    if (incluirDeshabilitados) {
      params = params.set('incluirDeshabilitados', 'true');
    }
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

  /**
   * Cambia el estado (habilitado / deshabilitado) de un usuario.
   * @param deleted true -> deshabilita, false -> rehabilita
   */
  cambiarEstado(id: number, deleted: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/estado`, { deleted });
  }
}
