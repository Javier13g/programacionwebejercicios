import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/producto.model';
import { Movimiento, MovimientoFiltros, MovimientoRequest } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/movimientos`;

  private authHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  listar(filtros: MovimientoFiltros = {}): Observable<PageResponse<Movimiento>> {
    let params = new HttpParams()
      .set('page', (filtros.page ?? 0).toString())
      .set('size', (filtros.size ?? 10).toString());

    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.productoId != null) {
      params = params.set('productoId', filtros.productoId.toString());
    }
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);

    return this.http.get<PageResponse<Movimiento>>(this.apiUrl, {
      params,
      headers: this.authHeaders()
    });
  }

  obtenerPorId(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders()
    });
  }

  crear(movimiento: MovimientoRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento, {
      headers: this.authHeaders()
    });
  }
}
