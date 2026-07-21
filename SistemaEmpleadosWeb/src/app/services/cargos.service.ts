import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargo, PageResponse } from '../models/empleado';
import { CargoRequest } from '../models/forms';

@Injectable({ providedIn: 'root' })
export class CargosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/cargos';

  listar(page: number = 0, size: number = 20): Observable<PageResponse<Cargo>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Cargo>>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Cargo> {
    return this.http.get<Cargo>(`${this.baseUrl}/${id}`);
  }

  crear(dto: CargoRequest): Observable<Cargo> {
    return this.http.post<Cargo>(this.baseUrl, dto);
  }

  actualizar(id: number, cambios: Partial<CargoRequest>): Observable<Cargo> {
    return this.http.patch<Cargo>(`${this.baseUrl}/${id}`, cambios);
  }
}
