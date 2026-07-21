import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado, PageResponse } from '../models/empleado';
import { EmpleadoRequest } from '../models/forms';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/empleados';

  listar(page: number = 0, size: number = 20): Observable<PageResponse<Empleado>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Empleado>>(this.baseUrl, { params });
  }

  listarCandidatosJefe(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.baseUrl}/candidatos-jefe`);
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
