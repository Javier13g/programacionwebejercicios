import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, of, switchMap } from 'rxjs';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgbModalModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.scss']
})
export class ProductoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productosService = inject(ProductosService);
  private readonly modalService = inject(NgbModal);

  readonly form: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(500)]],
    precioCompra: [0, [Validators.required, Validators.min(0.01)]],
    precioVenta: [0, [Validators.required, Validators.min(0.01)]],
    stockActual: [0, [Validators.min(0)]],
    stockMinimo: [0, [Validators.min(0)]]
  });

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploadingImage = signal(false);
  readonly deletingImage = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly currentImageUrl = signal<string | null>(null);
  readonly newImagePreview = signal<string | null>(null);
  private selectedFile: File | null = null;

  /** Snapshot del producto cargado del backend. Se usa para diff en PATCH. */
  private original: Producto | null = null;
  private productoId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) {
      this.errorMessage.set('ID de producto inválido');
      this.loading.set(false);
      return;
    }
    this.productoId = id;
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productosService.obtenerPorId(id).subscribe({
      next: (p) => {
        // Guardamos el producto COMPLETO como snapshot para comparar contra el
        // form al hacer PATCH. Asi sabemos qué campos realmente cambio el usuario.
        this.original = { ...p };
        this.form.patchValue({
          sku: p.sku,
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta,
          stockActual: p.stockActual ?? 0,
          stockMinimo: p.stockMinimo ?? 0
        });
        this.currentImageUrl.set(p.imageUrl ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.statusText || 'No se pudo cargar el producto'
        );
      }
    });
  }

  guardar(): void {
    if (this.form.invalid || this.productoId == null) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Construimos el payload con solo los campos que CAMBIARON vs el snapshot
    // original del backend. Si un campo no cambio, NO lo enviamos para que
    // el backend conserve el valor actual.
    const raw = this.form.getRawValue();
    const orig = this.original;
    const payload: Partial<Producto> = {};

    if (!orig) {
      this.errorMessage.set('No se cargo el producto original. Recarga la pagina.');
      this.saving.set(false);
      return;
    }

    // Comparamos contra el snapshot. Si difiere, lo incluimos en el payload.
    if ((raw.sku ?? '') !== (orig.sku ?? '')) payload.sku = raw.sku;
    if ((raw.nombre ?? '') !== (orig.nombre ?? '')) payload.nombre = raw.nombre;
    if ((raw.descripcion ?? '') !== (orig.descripcion ?? '')) payload.descripcion = raw.descripcion;
    if (Number(raw.precioCompra) !== Number(orig.precioCompra)) payload.precioCompra = Number(raw.precioCompra);
    if (Number(raw.precioVenta) !== Number(orig.precioVenta)) payload.precioVenta = Number(raw.precioVenta);
    if (Number(raw.stockActual ?? 0) !== Number(orig.stockActual ?? 0)) payload.stockActual = Number(raw.stockActual ?? 0);
    if (Number(raw.stockMinimo ?? 0) !== Number(orig.stockMinimo ?? 0)) payload.stockMinimo = Number(raw.stockMinimo ?? 0);

    // Si no cambio nada, avisamos y no llamamos al backend.
    if (Object.keys(payload).length === 0) {
      this.saving.set(false);
      // Si la imagen actual difiere de la original, es porque el usuario ya
      // la subio/elimino en una sesion previa (la cual se guarda por separado).
      // En ese caso la imagen YA esta guardada en backend, no hay nada que hacer.
      if (this.currentImageUrl() !== (this.original?.imageUrl ?? null)) {
        this.successMessage.set('Imagen ya guardada. No hay otros cambios pendientes.');
      } else {
        this.successMessage.set('No hay cambios para guardar.');
      }
      return;
    }

    this.productosService.actualizar(this.productoId, payload as Producto).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Producto actualizado correctamente.');
        setTimeout(() => this.router.navigate(['/productos', this.productoId]), 800);
      },
      error: (err) => {
        this.saving.set(false);
        // Si el backend devuelve un mapa de errores por campo, lo mostramos lindo.
        const fieldErrors = err?.error?.errors || err?.error?.fieldErrors;
        if (fieldErrors && typeof fieldErrors === 'object') {
          const lineas = Object.entries(fieldErrors)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');
          this.errorMessage.set(lineas);
        } else {
          this.errorMessage.set(
            err?.error?.message || err?.statusText || 'No se pudo guardar el producto'
          );
        }
      }
    });
  }

  cancelar(): void {
    if (this.productoId != null) {
      this.router.navigate(['/productos', this.productoId]);
    } else {
      this.router.navigate(['/productos']);
    }
  }

  /**
   * Maneja la seleccion de archivo. Solo guarda el File y muestra un preview local.
   * La subida a Imgur se hace al apretar "Subir imagen".
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validaciones del lado cliente (el backend tambien valida)
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('El archivo debe ser una imagen (jpg, png, gif, webp).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('La imagen excede el maximo permitido (10 MB).');
      return;
    }

    this.selectedFile = file;
    this.errorMessage.set(null);

    // Preview local con FileReader
    const reader = new FileReader();
    reader.onload = () => this.newImagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  /**
   * Sube la imagen seleccionada al backend (que la guarda en Imgur).
   */
  subirImagen(): void {
    if (!this.selectedFile || this.productoId == null) return;

    this.uploadingImage.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productosService.subirImagen(this.productoId, this.selectedFile).subscribe({
      next: (resp) => {
        this.currentImageUrl.set(resp.imageUrl);
        this.newImagePreview.set(null);
        this.selectedFile = null;
        this.uploadingImage.set(false);
        this.successMessage.set('Imagen subida correctamente.');
        // Sincronizamos el snapshot con la imagen recien subida para que
        // un "Guardar cambios" posterior no la considere como cambio pendiente.
        if (this.original) {
          this.original = { ...this.original, imageUrl: resp.imageUrl };
        }
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.statusText || 'No se pudo subir la imagen'
        );
      }
    });
  }

  /**
   * Cancela la seleccion de imagen (no toca la imagen actual).
   */
  cancelarImagen(): void {
    this.selectedFile = null;
    this.newImagePreview.set(null);
  }

  /**
   * Borra la imagen actual del producto (Imgur + BD).
   * Pide confirmacion con un modal de ng-bootstrap antes de ejecutar.
   */
  eliminarImagen(): void {
    if (this.productoId == null) return;

    const modalRef = this.modalService.open(ConfirmModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Eliminar imagen';
    modalRef.componentInstance.body =
      '¿Eliminar la imagen del producto? Esta accion la borra tambien de Imgur y no se puede deshacer.';
    modalRef.componentInstance.confirmText = 'Si, eliminar';
    modalRef.componentInstance.confirmClass = 'btn-danger';
    modalRef.componentInstance.icon = 'bi-image';

    modalRef.closed.subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.deletingImage.set(true);
      this.errorMessage.set(null);

      this.productosService.eliminarImagen(this.productoId!).subscribe({
        next: () => {
          this.currentImageUrl.set(null);
          this.deletingImage.set(false);
          this.successMessage.set('Imagen eliminada.');
          // Sincronizamos el snapshot para que un "Guardar cambios" posterior
          // no considere la imagen eliminada como cambio pendiente.
          if (this.original) {
            this.original = { ...this.original, imageUrl: undefined };
          }
        },
        error: (err) => {
          this.deletingImage.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.statusText || 'No se pudo eliminar la imagen'
          );
        }
      });
    });
  }

  get sku() { return this.form.get('sku'); }
  get nombre() { return this.form.get('nombre'); }
  get precioCompra() { return this.form.get('precioCompra'); }
  get precioVenta() { return this.form.get('precioVenta'); }
}
