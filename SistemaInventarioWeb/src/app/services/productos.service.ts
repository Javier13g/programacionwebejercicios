import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, PageResponse } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

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

  listar(
    q?: string,
    categoriaId?: number,
    proveedorId?: number,
    stockBajo?: boolean,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Producto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (q) params = params.set('q', q);
    if (categoriaId != null) params = params.set('categoriaId', categoriaId.toString());
    if (proveedorId != null) params = params.set('proveedorId', proveedorId.toString());
    if (stockBajo != null) params = params.set('stockBajo', stockBajo.toString());

    return this.http.get<PageResponse<Producto>>(this.apiUrl, {
      params,
      headers: this.authHeaders()
    });
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, { headers: this.authHeaders() });
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}`, producto, { headers: this.authHeaders() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  subirImagen(id: number, file: File): Observable<ImagenProductoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImagenProductoResponse>(
      `${this.apiUrl}/${id}/imagen`,
      formData,
      { headers: this.authHeaders() }
    );
  }

  eliminarImagen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/imagen`, { headers: this.authHeaders() });
  }
}

export interface ImagenProductoResponse {
  imageUrl: string;
  imageDeleteHash: string;
  link?: string;
}
