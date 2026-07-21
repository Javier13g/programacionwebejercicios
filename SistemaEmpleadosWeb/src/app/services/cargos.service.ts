import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargo, PageResponse } from '../models/empleado';
import { CargoRequest, NivelCargo } from '../models/forms';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CargosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.cargos;

  listar(page: number = 0, size: number = 20, q?: string, nivel?: NivelCargo | null): Observable<PageResponse<Cargo>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const termino = q?.trim();
    if (termino) {
      params = params.set('q', termino);
    }
    if (nivel) {
      params = params.set('nivel', nivel);
    }
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
