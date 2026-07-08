import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, shareReplay, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Juego,
  RawgGame,
  RawgListResponse,
} from '../models/producto.model';
import { TraduccionService } from './traduccion.service';

export interface JuegosFiltros {
  page?: number;
  pageSize?: number;
  search?: string;
  genres?: string;
  ordering?: string;
  dates?: string;
  metacritic?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly traduccion = inject(TraduccionService);
  private readonly base = environment.rawgBaseUrl;
  private readonly key = environment.rawgApiKey;
  private readonly priceBase = environment.priceBaseUsd;

  private destacados$?: Observable<Juego[]>;

  private readonly destacadoCache$ = new BehaviorSubject<Juego[]>([]);

  readonly destacadosEnOferta$: Observable<Juego[]> = this.destacadoCache$.pipe(
    tap((arr) =>
      console.debug(
        `[ProductosService] Cache destacados actualizado (${arr.length} items)`,
      ),
    ),
    map((arr) => arr.filter((j) => j.tieneOferta && !j.agotado)),
    filter((arr) => arr.length > 0),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  listar(filtros: JuegosFiltros = {}): Observable<RawgListResponse<Juego>> {
    const params = this.construirParams(filtros);
    return this.http
      .get<RawgListResponse<RawgGame>>(`${this.base}/games`, { params })
      .pipe(
        tap(() => console.debug('[ProductosService] GET /games', filtros)),
        map((resp) => ({
          count: resp.count,
          next: resp.next,
          previous: resp.previous,
          results: resp.results.map((g) => this.mapearJuego(g)),
        })),
        catchError((err) => {
          console.error('[ProductosService] Error en listar:', err);
          return throwError(() => err);
        }),
      );
  }

  obtenerPorId(id: string | number): Observable<Juego | null> {
    return this.http
      .get<RawgGame>(`${this.base}/games/${id}`, {
        params: this.paramsBase(),
      })
      .pipe(
        tap(() => console.debug(`[ProductosService] GET /games/${id}`)),
        map((g) => (g ? this.mapearJuego(g) : null)),
        catchError((err) => {
          console.error(`[ProductosService] Error en obtenerPorId(${id}):`, err);
          return of(null);
        }),
      );
  }


  cargarDestacados(pageSize = 12): Observable<Juego[]> {
    if (!this.destacados$) {
      this.destacados$ = this.listar({
        pageSize,
        ordering: '-rating',
        metacritic: '60,100',
      }).pipe(
        map((r) => r.results),
        tap((arr) => this.destacadoCache$.next(arr)),
        catchError((err) => {
          console.error('[ProductosService] Error cargando destacados:', err);
          return of([] as Juego[]);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.destacados$;
  }

  cargarCatalogo(
    filtros: Omit<JuegosFiltros, 'page' | 'pageSize'> = {},
    pageSize = 40,
  ): Observable<RawgListResponse<Juego>> {
    return this.listar({ ...filtros, page: 1, pageSize });
  }

  /**
   * Carga una página específica del catálogo (para "Cargar más").
   * El consumidor debe concatenar los resultados a los ya existentes.
   *
   * @param page Número de página a cargar (1-based)
   * @param filtros Filtros a aplicar (sin page/pageSize)
   * @param pageSize Tamaño de página
   */
  cargarPagina(
    page: number,
    filtros: Omit<JuegosFiltros, 'page' | 'pageSize'> = {},
    pageSize = 40,
  ): Observable<RawgListResponse<Juego>> {
    return this.listar({ ...filtros, page, pageSize });
  }


  buscarPorNombre(texto: string, pageSize = 40): Observable<RawgListResponse<Juego>> {
    return this.listar({ search: texto, page: 1, pageSize });
  }

  filtrar(
    lista: Juego[],
    criterios: {
      texto?: string;
      categoria?: string;
      precioMax?: number;
      soloDisponibles?: boolean;
    } = {},
  ): Juego[] {
    return lista.filter((j) => {
      if (criterios.texto) {
        const t = criterios.texto.toLowerCase();
        const cumple =
          j.nombre.toLowerCase().includes(t) ||
          j.categoria.toLowerCase().includes(t) ||
          j.plataformas.toLowerCase().includes(t);
        if (!cumple) return false;
      }
      if (criterios.categoria && criterios.categoria !== '') {
        if (j.categoria.toLowerCase() !== criterios.categoria.toLowerCase()) {
          return false;
        }
      }
      if (
        typeof criterios.precioMax === 'number' &&
        criterios.precioMax > 0 &&
        j.precioConDescuento > criterios.precioMax
      ) {
        return false;
      }
      if (criterios.soloDisponibles && j.agotado) {
        return false;
      }
      return true;
    });
  }


  private construirParams(f: JuegosFiltros): HttpParams {
    let params = this.paramsBase();
    if (f.page) params = params.set('page', String(f.page));
    if (f.pageSize) params = params.set('page_size', String(f.pageSize));
    if (f.search) params = params.set('search', f.search);
    if (f.genres) params = params.set('genres', f.genres);
    if (f.ordering) params = params.set('ordering', f.ordering);
    if (f.dates) params = params.set('dates', f.dates);
    if (f.metacritic) params = params.set('metacritic', f.metacritic);
    return params;
  }

  private paramsBase(): HttpParams {
    return new HttpParams().set('key', this.key);
  }

  private mapearJuego(g: RawgGame): Juego {
    const rating = Number(g.rating) || 0;
    const metacritic = g.metacritic ?? null;
    const tasa = 60;
    const factor = 0.6 + rating / 5;
    const metaFactor = metacritic ? metacritic / 100 : 0.5;
    const precioBase = Math.round(this.priceBase * factor * (0.7 + metaFactor));
    const precio = Math.round(precioBase * tasa);

    const oferta = this.calcularOfertaDeterminista(g.slug);

    const tieneOferta = oferta > 0;
    const precioConDescuento = tieneOferta
      ? Math.round(precio * (1 - oferta / 100))
      : precio;

    const stock = Math.abs(g.id) % 13;
    const agotado = stock === 0;
    const estado = agotado
      ? 'Agotado'
      : stock <= 2
        ? 'Pocas unidades'
        : 'Disponible';

    const plataformas = (g.platforms ?? [])
      .map((p) => p.platform?.name)
      .filter(Boolean)
      .slice(0, 4)
      .map((p) => this.traduccion.traducirPlataforma(p))
      .join(', ');

    const categoriaGeneroIngles = g.genres?.[0]?.name ?? 'Sin clasificar';
    const categoria = this.traduccion.traducirGenero(categoriaGeneroIngles);

    return {
      id: g.id,
      nombre: g.name,
      slug: g.slug,
      categoria,
      plataformas: plataformas || 'Multiplataforma',
      precio,
      precioConDescuento,
      tieneOferta,
      oferta,
      imagen: g.background_image ?? '',
      descripcionOriginal: g.description_raw ?? null,
      descripcion:
        g.description_raw?.slice(0, 280) ||
        `Descubre ${g.name}, uno de los títulos mejor valorados en ${categoria}.`,
      rating,
      metacritic,
      released: g.released ?? 'Por anunciar',
      agotado,
      estado,
      especificaciones: this.construirEspecificaciones(g),
    };
  }

  private calcularOfertaDeterminista(slug: string): number {
    let h = 0;
    for (let i = 0; i < slug.length; i++) {
      h = (h * 31 + slug.charCodeAt(i)) >>> 0;
    }
    const r = h % 100;
    if (r < 60) return 0;
    if (r < 80) return 10;
    if (r < 95) return 20;
    return 35;
  }

  private construirEspecificaciones(g: RawgGame) {
    const specs: { caracteristica: string; valor: string }[] = [];
    specs.push({ caracteristica: 'Lanzamiento', valor: g.released ?? 'Por anunciar' });
    if (g.metacritic) {
      specs.push({ caracteristica: 'Metacritic', valor: `${g.metacritic} / 100` });
    }
    specs.push({ caracteristica: 'Rating RAWG', valor: `${(g.rating ?? 0).toFixed(2)} / 5` });
    if (g.playtime) {
      specs.push({ caracteristica: 'Duración promedio', valor: `${g.playtime} horas` });
    }
    if (g.genres?.length) {
      specs.push({
        caracteristica: 'Géneros',
        valor: g.genres.map((x) => this.traduccion.traducirGenero(x.name)).join(', '),
      });
    }
    if (g.platforms?.length) {
      specs.push({
        caracteristica: 'Plataformas',
        valor: g.platforms.map((p) => this.traduccion.traducirPlataforma(p.platform.name)).join(', '),
      });
    }
    return specs;
  }
}
