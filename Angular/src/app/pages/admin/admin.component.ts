import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductoAdminService, ProductoAdmin } from '../../services/producto-admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(ProductoAdminService);
  readonly auth = inject(AuthService);

  readonly productos = signal<ProductoAdmin[]>([]);
  readonly editando = signal<ProductoAdmin | null>(null);
  readonly cargando = signal(false);

  readonly form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    categoria: ['', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    precioAnterior: [0, [Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imagen: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly categoriasDisponibles = [
    'Acción',
    'Aventura',
    'Rol',
    'Estrategia',
    'Shooter',
    'Indie',
    'Puzzle',
    'Carreras',
    'Deportes',
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.adminService.listar().subscribe({
      next: (lista) => {
        this.productos.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  nuevo(): void {
    this.editando.set(null);
    this.form.reset({
      nombre: '',
      categoria: '',
      precio: 0,
      precioAnterior: 0,
      stock: 0,
      imagen: '',
      descripcion: '',
    });
  }

  editar(p: ProductoAdmin): void {
    this.editando.set(p);
    this.form.patchValue({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      precioAnterior: p.precioAnterior ?? 0,
      stock: p.stock,
      imagen: p.imagen,
      descripcion: p.descripcion,
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.value as Omit<ProductoAdmin, 'id' | 'creadoEn'>;
    const ed = this.editando();
    this.cargando.set(true);

    const op = ed
      ? this.adminService.actualizar(ed.id, datos)
      : this.adminService.crear(datos);

    op.subscribe({
      next: () => {
        this.cargar();
        this.nuevo();
      },
      error: () => this.cargando.set(false),
    });
  }

  eliminar(p: ProductoAdmin): void {
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
    this.adminService.eliminar(p.id).subscribe({
      next: () => this.cargar(),
    });
  }

  cancelarEdicion(): void {
    this.nuevo();
  }

  // Helpers de acceso al form
  ctrl(name: string) {
    return this.form.get(name);
  }
  tieneError(name: string, err: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.touched && !!c.errors?.[err];
  }
}
