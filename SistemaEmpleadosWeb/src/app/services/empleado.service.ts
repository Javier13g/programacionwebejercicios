import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado, PageResponse } from '../models/empleado';
import { EmpleadoRequest } from '../models/forms';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.empleados;

  listar(page: number = 0, size: number = 20, q?: string): Observable<PageResponse<Empleado>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const termino = q?.trim();
    if (termino) {
      params = params.set('q', termino);
    }
    return this.http.get<PageResponse<Empleado>>(this.baseUrl, { params });
  }

  /**
   * Lista candidatos a jefe (empleados activos con su cargo).
   * Si se pasa excludeId, ese empleado NO aparece (para no proponer
   * al propio empleado como su jefe en modo edición).
   */
  listarCandidatosJefe(excludeId?: number | null): Observable<Empleado[]> {
    let params = new HttpParams();
    if (excludeId != null) {
      params = params.set('excludeId', excludeId.toString());
    }
    return this.http.get<Empleado[]>(`${this.baseUrl}/candidatos-jefe`, { params });
  }

  obtener(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.baseUrl}/${id}`);
  }

  crear(dto: EmpleadoRequest): Observable<Empleado> {
    return this.http.post<Empleado>(this.baseUrl, dto);
  }

  actualizar(id: number, cambios: Partial<EmpleadoRequest>): Observable<Empleado> {
    return this.http.patch<Empleado>(`${this.baseUrl}/${id}`, cambios);
  }
}
