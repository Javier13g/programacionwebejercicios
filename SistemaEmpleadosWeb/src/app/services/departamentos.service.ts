import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento, PageResponse } from '../models/empleado';
import { DepartamentoRequest } from '../models/forms';

@Injectable({ providedIn: 'root' })
export class DepartamentosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/departamentos';

  listar(page: number = 0, size: number = 20): Observable<PageResponse<Departamento>> {
    const params = new HttpParams().set('page', page).set('size', size);
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
