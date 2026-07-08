import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { UtilidadesService } from './utilidades.service';

export interface ProductoAdmin {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  precioAnterior?: number;
  stock: number;
  imagen: string;
  descripcion: string;
  creadoEn: string;
}

const CLAVE = 'gamestore_admin_productos';


@Injectable({ providedIn: 'root' })
export class ProductoAdminService {
  private readonly utils = inject(UtilidadesService);

  private readonly productos$ = new BehaviorSubject<ProductoAdmin[]>(this.cargarInicial());

  readonly lista$: Observable<ProductoAdmin[]> = this.productos$.asObservable();

  listar(): Observable<ProductoAdmin[]> {
    return this.lista$.pipe(
      delay(100),
      map((arr) => [...arr]),
      catchError((err) => {
        console.error('Error listando productos admin:', err);
        return of<ProductoAdmin[]>([]);
      }),
    );
  }

  crear(datos: Omit<ProductoAdmin, 'id' | 'creadoEn'>): Observable<ProductoAdmin> {
    const nuevo: ProductoAdmin = {
      ...datos,
      id: Date.now(),
      creadoEn: new Date().toISOString(),
    };
    const lista = [...this.productos$.value, nuevo];
    return of(nuevo).pipe(
      delay(150),
      tap(() => {
        this.productos$.next(lista);
        this.persistir(lista);
      }),
    );
  }

  actualizar(id: number, cambios: Partial<ProductoAdmin>): Observable<ProductoAdmin | null> {
    const lista = this.productos$.value.map((p) =>
      p.id === id ? { ...p, ...cambios } : p,
    );
    const actualizado = lista.find((p) => p.id === id) ?? null;
    return of(actualizado).pipe(
      delay(150),
      tap(() => {
        this.productos$.next(lista);
        this.persistir(lista);
      }),
    );
  }

  eliminar(id: number): Observable<boolean> {
    const lista = this.productos$.value.filter((p) => p.id !== id);
    const borrado = lista.length < this.productos$.value.length;
    return of(borrado).pipe(
      delay(120),
      tap(() => {
        this.productos$.next(lista);
        this.persistir(lista);
      }),
    );
  }

  private cargarInicial(): ProductoAdmin[] {
    const guardados = this.utils.leer<ProductoAdmin[]>(CLAVE, []);
    if (guardados && guardados.length > 0) return guardados;

    const seed: ProductoAdmin[] = [
      {
        id: 1,
        nombre: 'The Legend of Zelda: Tears of the Kingdom',
        categoria: 'Aventura',
        precio: 4500,
        precioAnterior: 5500,
        stock: 12,
        imagen: 'https://media.rawg.io/media/games/d1f/d1f872d2b1fcf5bc5c8d11c3c2c7c5fc.jpg',
        descripcion: 'Secuela de Breath of the Wild con mecánicas de construcción.',
        creadoEn: new Date().toISOString(),
      },
      {
        id: 2,
        nombre: 'Elden Ring',
        categoria: 'Rol',
        precio: 3800,
        stock: 8,
        imagen: 'https://media.rawg.io/media/games/b29/b294f5c1ca59d5c4c5c5d8d2e1a3d4e3.jpg',
        descripcion: 'Action RPG de FromSoftware en mundo abierto.',
        creadoEn: new Date().toISOString(),
      },
      {
        id: 3,
        nombre: 'Hades',
        categoria: 'Indie',
        precio: 1200,
        precioAnterior: 1500,
        stock: 20,
        imagen: 'https://media.rawg.io/media/games/1f4/1f4889f9f1e3c5b1a3f0e8b1b5c2d8e1.jpg',
        descripcion: 'Roguelike de acción con narrativa excepcional.',
        creadoEn: new Date().toISOString(),
      },
    ];
    this.persistir(seed);
    return seed;
  }

  private persistir(lista: ProductoAdmin[]): void {
    this.utils.guardar(CLAVE, lista);
  }
}
