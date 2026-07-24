import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria, PageResponse } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

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

  listarTodas(): Observable<Categoria[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000');
    return new Observable<Categoria[]>((subscriber) => {
      this.http
        .get<PageResponse<Categoria>>(this.apiUrl, {
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
