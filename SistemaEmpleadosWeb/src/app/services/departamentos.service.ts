import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento, PageResponse } from '../models/empleado';
import { DepartamentoRequest } from '../models/forms';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartamentosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.departamentos;

  listar(page: number = 0, size: number = 20, q?: string): Observable<PageResponse<Departamento>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const termino = q?.trim();
    if (termino) {
      params = params.set('q', termino);
    }
    return this.http.get<PageResponse<Departamento>>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Departamento> {
    return this.http.get<Departamento>(`${this.baseUrl}/${id}`);
  }

  crear(dto: DepartamentoRequest): Observable<Departamento> {
    return this.http.post<Departamento>(this.baseUrl, dto);
  }

  actualizar(id: number, cambios: Partial<DepartamentoRequest>): Observable<Departamento> {
    return this.http.patch<Departamento>(`${this.baseUrl}/${id}`, cambios);
  }
}
