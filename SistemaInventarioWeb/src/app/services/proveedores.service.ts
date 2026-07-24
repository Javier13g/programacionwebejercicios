import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Proveedor, PageResponse } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/proveedores`;

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

  listarTodos(): Observable<Proveedor[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000');
    return new Observable<Proveedor[]>((subscriber) => {
      this.http
        .get<PageResponse<Proveedor>>(this.apiUrl, {
          params,
          headers: this.authHeaders()
        })
        .subscribe({
          next: (page) => subscriber.next(page.content ?? []),
          error: (err) => subscriber.error(err)
        });
    });
  }
}
