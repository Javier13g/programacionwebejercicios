import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';
import { ProveedoresService } from '../../services/proveedores.service';
import { Categoria, Producto, Proveedor } from '../../models/producto.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModalModule, SidebarComponent],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.scss']
})
export class ProductoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productosService = inject(ProductosService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly proveedoresService = inject(ProveedoresService);
  private readonly modalService = inject(NgbModal);

  readonly isEditMode = signal(false);

  readonly form: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(500)]],
    precioCompra: [0, [Validators.required, Validators.min(0.01)]],
    precioVenta: [0, [Validators.required, Validators.min(0.01)]],
    stockActual: [0, [Validators.min(0)]],
    stockMinimo: [0, [Validators.min(0)]],
    categoriaId: [null as number | null],
    proveedorId: [null as number | null]
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

  readonly categorias = signal<Categoria[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly loadingSelects = signal(false);

  private original: Producto | null = null;
  private productoId: number | null = null;

  readonly titulo = computed(() =>
    this.isEditMode() ? 'Editar producto' : 'Nuevo producto'
  );

  readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Guardar cambios' : 'Crear producto'
  );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === 'nuevo' || idParam == null) {
      this.iniciarCreacion();
    } else {
      const id = Number(idParam);
      if (!id || Number.isNaN(id)) {
        this.errorMessage.set('ID de producto inválido');
        this.loading.set(false);
        return;
      }
      this.productoId = id;
      this.isEditMode.set(true);
      this.cargar(id);
    }

    this.cargarSelects();
  }

  private iniciarCreacion(): void {
    this.isEditMode.set(false);
    this.productoId = null;
    this.original = null;
    this.currentImageUrl.set(null);
    this.form.reset({
      sku: '',
      nombre: '',
      descripcion: '',
      precioCompra: 0,
      precioVenta: 0,
      stockActual: 0,
      stockMinimo: 0,
      categoriaId: null,
      proveedorId: null
    });
    this.form.get('categoriaId')?.setValidators([Validators.required]);
    this.form.get('categoriaId')?.updateValueAndValidity();
    this.form.get('proveedorId')?.setValidators([Validators.required]);
    this.form.get('proveedorId')?.updateValueAndValidity();
    this.loading.set(false);
  }


  private cargarSelects(): void {
    this.loadingSelects.set(true);
    let pendientes = 2;
    const terminar = () => {
      pendientes--;
      if (pendientes === 0) this.loadingSelects.set(false);
    };

    this.categoriasService.listarTodas().subscribe({
      next: (cats) => this.categorias.set(cats ?? []),
      error: () => this.categorias.set([]),
      complete: terminar
    });
    this.proveedoresService.listarTodos().subscribe({
      next: (provs) => this.proveedores.set(provs ?? []),
      error: () => this.proveedores.set([]),
      complete: terminar
    });
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productosService.obtenerPorId(id).subscribe({
      next: (p) => {
        this.original = { ...p };
        this.form.patchValue({
          sku: p.sku,
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta,
          stockActual: p.stockActual ?? 0,
          stockMinimo: p.stockMinimo ?? 0,
          categoriaId: p.categoria?.id ?? null,
          proveedorId: p.proveedor?.id ?? null
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode()) {
      this.guardarEdicion();
    } else {
      this.guardarCreacion();
    }
  }


  private guardarCreacion(): void {
    const raw = this.form.getRawValue();
    const payload: Producto = {
      sku: raw.sku,
      nombre: raw.nombre,
      descripcion: raw.descripcion ?? '',
      precioCompra: Number(raw.precioCompra),
      precioVenta: Number(raw.precioVenta),
      stockActual: Number(raw.stockActual ?? 0),
      stockMinimo: Number(raw.stockMinimo ?? 0),
      categoriaId: Number(raw.categoriaId),
      proveedorId: Number(raw.proveedorId)
    };

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productosService.crear(payload).subscribe({
      next: (creado) => {
        const nuevoId = creado.id;
        if (nuevoId == null) {
          this.saving.set(false);
          this.errorMessage.set('El backend no devolvió el id del producto creado.');
          return;
        }
        if (this.selectedFile) {
          this.subirImagenDespuesDeCrear(nuevoId);
          return;
        }
        this.saving.set(false);
        this.successMessage.set('Producto creado correctamente.');
        setTimeout(() => this.router.navigate(['/productos', nuevoId]), 600);
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
            err?.error?.message || err?.statusText || 'No se pudo crear el producto'
          );
        }
      }
    });
  }

  private subirImagenDespuesDeCrear(nuevoId: number): void {
    this.uploadingImage.set(true);
    const file = this.selectedFile!;
    this.productosService.subirImagen(nuevoId, file).subscribe({
      next: () => {
        this.uploadingImage.set(false);
        this.saving.set(false);
        this.successMessage.set('Producto creado con imagen.');
        setTimeout(() => this.router.navigate(['/productos', nuevoId]), 600);
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.saving.set(false);
        this.successMessage.set(
          'Producto creado. No se pudo subir la imagen: ' +
            (err?.error?.message || err?.statusText || 'error desconocido')
        );
        setTimeout(() => this.router.navigate(['/productos', nuevoId]), 1500);
      }
    });
  }

  private guardarEdicion(): void {
    if (this.productoId == null) return;
    if (!this.original) {
      this.errorMessage.set('No se cargo el producto original. Recarga la pagina.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.selectedFile) {
      this.uploadingImage.set(true);
      const fileToUpload = this.selectedFile;
      this.productosService.subirImagen(this.productoId, fileToUpload).subscribe({
        next: (resp) => {
          this.currentImageUrl.set(resp.imageUrl);
          this.newImagePreview.set(null);
          this.selectedFile = null;
          this.uploadingImage.set(false);
          this.original = { ...this.original!, imageUrl: resp.imageUrl };
          this.aplicarPatch();
        },
        error: (err) => {
          this.uploadingImage.set(false);
          this.saving.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.statusText || 'No se pudo subir la imagen'
          );
        }
      });
      return;
    }

    this.aplicarPatch();
  }


  private aplicarPatch(): void {
    const orig = this.original!;
    const raw = this.form.getRawValue();
    const payload: Partial<Producto> = {};

    if ((raw.sku ?? '') !== (orig.sku ?? '')) payload.sku = raw.sku;
    if ((raw.nombre ?? '') !== (orig.nombre ?? '')) payload.nombre = raw.nombre;
    if ((raw.descripcion ?? '') !== (orig.descripcion ?? '')) payload.descripcion = raw.descripcion;
    if (Number(raw.precioCompra) !== Number(orig.precioCompra)) payload.precioCompra = Number(raw.precioCompra);
    if (Number(raw.precioVenta) !== Number(orig.precioVenta)) payload.precioVenta = Number(raw.precioVenta);
    if (Number(raw.stockActual ?? 0) !== Number(orig.stockActual ?? 0)) payload.stockActual = Number(raw.stockActual ?? 0);
    if (Number(raw.stockMinimo ?? 0) !== Number(orig.stockMinimo ?? 0)) payload.stockMinimo = Number(raw.stockMinimo ?? 0);
    if (Number(raw.categoriaId ?? 0) !== Number(orig.categoria?.id ?? 0)) {
      payload.categoriaId = Number(raw.categoriaId);
    }
    if (Number(raw.proveedorId ?? 0) !== Number(orig.proveedor?.id ?? 0)) {
      payload.proveedorId = Number(raw.proveedorId);
    }

    if (Object.keys(payload).length === 0) {
      this.saving.set(false);
      this.successMessage.set('Imagen guardada. No hay otros cambios pendientes.');
      return;
    }

    this.productosService.actualizar(this.productoId!, payload as Producto).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Producto actualizado correctamente.');
        setTimeout(() => this.router.navigate(['/productos', this.productoId]), 800);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

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

    const reader = new FileReader();
    reader.onload = () => this.newImagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

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

  cancelarImagen(): void {
    this.selectedFile = null;
    this.newImagePreview.set(null);
  }

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
  get categoriaId() { return this.form.get('categoriaId'); }
  get proveedorId() { return this.form.get('proveedorId'); }
}
