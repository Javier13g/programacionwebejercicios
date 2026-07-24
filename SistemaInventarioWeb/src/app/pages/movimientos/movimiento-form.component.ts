import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { MovimientosService } from '../../services/movimientos.service';
import { ProductosService } from '../../services/productos.service';
import { TipoMovimiento } from '../../models/movimiento.model';
import { Producto } from '../../models/producto.model';


@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeahead
  ],
  templateUrl: './movimiento-form.component.html'
})
export class MovimientoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly movimientosService = inject(MovimientosService);
  private readonly productosService = inject(ProductosService);
  readonly activeModal = inject(NgbActiveModal);

  readonly form: FormGroup = this.fb.group({
    productoId: [null as number | null, [Validators.required]],
    tipo: ['ENTRADA' as TipoMovimiento, [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    observacion: ['', [Validators.maxLength(500)]]
  });

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  productoSeleccionado: Producto | null = null;
  readonly productoBuscando = signal(false);
  readonly productoBusquedaFallida = signal(false);

  readonly tipos: { value: TipoMovimiento; label: string; help: string }[] = [
    { value: 'ENTRADA', label: 'Entrada', help: 'Suma al stock actual (compras, devoluciones).' },
    { value: 'SALIDA', label: 'Salida', help: 'Resta del stock actual (ventas, mermas).' },
    { value: 'AJUSTE', label: 'Ajuste', help: 'Reemplaza el stock actual por la cantidad indicada.' }
  ];

  ngOnInit(): void {
  }

  readonly typeaheadSearch = (text$: Observable<string>): Observable<Producto[]> => {
    return text$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => {
        this.productoBuscando.set(true);
        this.productoBusquedaFallida.set(false);
      }),
      switchMap((term) => {
        const limpio = (term ?? '').trim();
        if (limpio.length < 2) {
          this.productoBuscando.set(false);
          return of<Producto[]>([]);
        }
        return this.productosService
          .listar(limpio, undefined, undefined, undefined, 0, 20)
          .pipe(
            map((page) => page.content ?? []),
            tap(() => this.productoBuscando.set(false)),
            catchError(() => {
              this.productoBuscando.set(false);
              this.productoBusquedaFallida.set(true);
              return of<Producto[]>([]);
            })
          );
      })
    );
  };

  readonly typeaheadResultFormatter = (p: Producto): string =>
    p ? `${p.sku} — ${p.nombre}` : '';

  readonly typeaheadInputFormatter = (p: Producto | string | null | undefined): string => {
    if (!p) return '';
    if (typeof p === 'string') return p;
    return `${p.sku} — ${p.nombre}`;
  };

  onProductoSelect(event: { item: Producto; preventDefault: () => void }): void {
    event.preventDefault();
    this.productoSeleccionado = event.item;
    this.form.get('productoId')?.setValue(event.item.id ?? null);
    this.form.get('productoId')?.markAsTouched();
  }

  limpiarProducto(): void {
    this.productoSeleccionado = null;
    this.form.get('productoId')?.setValue(null);
    this.form.get('productoId')?.markAsTouched();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth.currentUser();
    if (!user?.id) {
      this.errorMessage.set('No hay un usuario autenticado. Vuelve a iniciar sesión.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    this.movimientosService
      .crear({
        productoId: Number(raw.productoId),
        usuarioId: user.id,
        tipo: raw.tipo,
        cantidad: Number(raw.cantidad),
        observacion: raw.observacion?.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.activeModal.close(true);
        },
        error: (err) => {
          this.saving.set(false);
          const fieldErrors = err?.error?.errors || err?.error?.fieldErrors;
          if (fieldErrors && typeof fieldErrors === 'object') {
            const lineas = Object.entries(fieldErrors)
              .map(([k, v]) => `${k}: ${v}`)
              .join('; ');
            this.errorMessage.set(lineas);
          } else {
            this.errorMessage.set(
              err?.error?.message || err?.statusText || 'No se pudo registrar el movimiento'
            );
          }
        }
      });
  }

  cancelar(): void {
    this.activeModal.dismiss(false);
  }

  get productoId() { return this.form.get('productoId'); }
  get tipo() { return this.form.get('tipo'); }
  get cantidad() { return this.form.get('cantidad'); }
  get observacion() { return this.form.get('observacion'); }

  tipoHelp(): string {
    return this.tipos.find((t) => t.value === this.tipo?.value)?.help ?? '';
  }
}
