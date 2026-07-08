import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Juego, ItemCarrito, ResumenCarrito } from '../models/producto.model';
import { UtilidadesService } from './utilidades.service';

const CLAVE_STORAGE = 'gamestore_carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly utils = inject(UtilidadesService);
  private readonly _items = signal<ItemCarrito[]>(this.cargarInicial());

  readonly items = this._items.asReadonly();
  readonly cantidad = computed(() =>
    this._items().reduce((s, i) => s + i.cantidad, 0),
  );
  readonly subtotal = computed(() =>
    Number(
      this._items()
        .reduce((s, i) => s + i.precio * i.cantidad, 0)
        .toFixed(2),
    ),
  );
  readonly impuestos = computed(() =>
    Number(this.utils.calcularIVA(this.subtotal(), environment.taxRate).toFixed(2)),
  );
  readonly total = computed(() =>
    Number((this.subtotal() + this.impuestos()).toFixed(2)),
  );
  readonly vacio = computed(() => this._items().length === 0);

  private readonly items$ = new BehaviorSubject<ItemCarrito[]>(this._items());

  readonly cambios$: Observable<ItemCarrito[]> = this.items$.asObservable();

  readonly resumen$: Observable<ResumenCarrito> = this.cambios$.pipe(
    map(() => this.resumen()),
    tap(() => undefined),
  );

  private cargarInicial(): ItemCarrito[] {
    return this.utils.leer<ItemCarrito[]>(CLAVE_STORAGE, []) ?? [];
  }

  private persistir(): void {
    this.utils.guardar(CLAVE_STORAGE, this._items());
    this.items$.next([...this._items()]);
  }

  resumen(): ResumenCarrito {
    return {
      cantidad: this.cantidad(),
      subtotal: this.subtotal(),
      impuestos: this.impuestos(),
      total: this.total(),
      vacio: this.vacio(),
    };
  }

  agregar(juego: Juego, cantidad = 1): boolean {
    if (!juego || juego.agotado) return false;
    const items = [...this._items()];
    const existente = items.find((i) => i.id === juego.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({
        id: juego.id,
        nombre: juego.nombre,
        precio: juego.precioConDescuento,
        imagen: juego.imagen,
        cantidad,
      });
    }
    this._items.set(items);
    this.persistir();
    return true;
  }

  eliminar(id: number): boolean {
    const idx = this._items().findIndex((i) => i.id === Number(id));
    if (idx === -1) return false;
    const items = [...this._items()];
    items.splice(idx, 1);
    this._items.set(items);
    this.persistir();
    return true;
  }

  actualizarCantidad(id: number, cantidad: number): boolean {
    if (cantidad <= 0) return this.eliminar(id);
    const items = [...this._items()];
    const item = items.find((i) => i.id === Number(id));
    if (!item) return false;
    item.cantidad = Number(cantidad);
    this._items.set(items);
    this.persistir();
    return true;
  }

  vaciar(): void {
    if (this._items().length === 0) return;
    this._items.set([]);
    this.persistir();
  }

  finalizarCompra() {
    if (this.vacio()) return null;
    const orden = {
      numero: this.utils.generarNumeroOrden('GAME'),
      fecha: new Date().toISOString(),
      items: [...this.items()],
      subtotal: this.subtotal(),
      impuestos: this.impuestos(),
      total: this.total(),
    };
    this.utils.guardar('gamestore_ultima_orden', orden);

    const hist = this.utils.leer<unknown[]>('gamestore_historial', []) ?? [];
    hist.unshift(orden);
    this.utils.guardar('gamestore_historial', hist);

    this._items.set([]);
    this.persistir();
    return orden;
  }
}
