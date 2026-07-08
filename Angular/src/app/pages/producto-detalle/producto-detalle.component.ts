import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { UtilidadesService } from '../../services/utilidades.service';
import { TraduccionService } from '../../services/traduccion.service';
import { Juego } from '../../models/producto.model';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css',
})
export class ProductoDetalleComponent implements OnInit, OnDestroy {
  // Mantenemos el nombre `ProductoDetalleComponent` para no tocar las rutas.
  // Semánticamente es la página de detalle de un Juego (RAWG).
  private readonly productosService = inject(ProductosService);
  private readonly traduccion = inject(TraduccionService);
  private readonly route = inject(ActivatedRoute);
  readonly carrito = inject(CarritoService);
  readonly utils = inject(UtilidadesService);

  readonly juego = signal<Juego | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly cantidad = signal(1);
  readonly mensaje = signal<string | null>(null);

  // Descripción traducida al español (si está disponible)
  readonly descripcionTraducida = signal<string | null>(null);
  readonly traduciendoDescripcion = signal(false);
  private traduccionSub?: Subscription;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.error.set('ID de juego no proporcionado');
      this.cargando.set(false);
      return;
    }
    this.productosService.obtenerPorId(id).subscribe({
      next: (j) => {
        this.juego.set(j);
        this.cargando.set(false);
        // Una vez tenemos el juego, traducimos su descripción
        this.traducirDescripcionDeJuego(j);
      },
      error: (err) => {
        console.error('Error al cargar juego:', err);
        this.error.set(err?.message ?? 'No se pudo cargar el juego');
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.traduccionSub?.unsubscribe();
  }

  /**
   * Lanza la traducción de la descripción completa del juego.
   * Si no hay descripción original, usa la truncada como fallback.
   */
  private traducirDescripcionDeJuego(j: Juego): void {
    this.traduccionSub?.unsubscribe();
    this.descripcionTraducida.set(null);

    const original = j.descripcionOriginal;
    if (!original) {
      // Sin descripción completa → usar la truncada
      this.descripcionTraducida.set(j.descripcion ?? null);
      return;
    }

    console.log('[Detalle] Solicitando traducción...', { length: original.length });
    this.traduciendoDescripcion.set(true);

    this.traduccionSub = this.traduccion
      .traducirDescripcion(original)
      .subscribe({
        next: (texto) => {
          console.log('[Detalle] Traducción recibida', {
            length: texto.length,
            preview: texto.slice(0, 80),
          });
          this.descripcionTraducida.set(texto);
          this.traduciendoDescripcion.set(false);
        },
        error: (err) => {
          console.error('[Detalle] Error traduciendo:', err);
          this.descripcionTraducida.set(j.descripcion ?? null);
          this.traduciendoDescripcion.set(false);
        },
      });
  }

  agregar(): void {
    const j = this.juego();
    if (!j || j.agotado) return;
    const ok = this.carrito.agregar(j, this.cantidad());
    this.mensaje.set(ok ? `${j.nombre} agregado al carrito.` : 'Juego no disponible.');
    setTimeout(() => this.mensaje.set(null), 2500);
  }

  estrellas(): string {
    const r = Math.round(this.juego()?.rating ?? 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }
}
