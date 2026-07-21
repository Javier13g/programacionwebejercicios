import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CargosService } from '../../../services/cargos.service';
import { ToastService } from '../../../services/toast.service';
import { Cargo } from '../../../models/empleado';
import { CargoRequest, NIVELES_CARGO, NivelCargo } from '../../../models/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-cargo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class CargoFormComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cargosService = inject(CargosService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly niveles = NIVELES_CARGO;

  readonly modoEdicion = signal(false);
  readonly cargoId = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);

  form!: FormGroup;
  private originales: Record<string, unknown> = {};

  ngOnInit(): void {
    this.inicializarForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      const id = Number(idParam);
      if (Number.isNaN(id)) {
        this.toastService.error('ID de cargo inválido');
        this.cargando.set(false);
        return;
      }
      this.modoEdicion.set(true);
      this.cargoId.set(id);
      this.cargar(id);
    } else {
      this.modoEdicion.set(false);
      this.cargando.set(false);
    }
  }

  private inicializarForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      nivel: ['Operativo' as NivelCargo, [Validators.required]],
      salarioBase: [null as number | null, [Validators.required, Validators.min(0.01)]]
    });
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.cargosService.obtener(id).subscribe({
      next: (c: Cargo) => {
        const valores = {
          nombre: c.nombre,
          nivel: c.nivel as NivelCargo,
          salarioBase: c.salarioBase
        };
        this.form.patchValue(valores);
        this.originales = { ...valores };
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Cargo no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Revisá los campos marcados en rojo');
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {
      this.actualizar();
    } else {
      this.crear();
    }
  }

  private crear(): void {
    const raw = this.form.value;
    const dto: CargoRequest = {
      nombre: raw.nombre,
      nivel: raw.nivel,
      salarioBase: Number(raw.salarioBase)
    };

    this.cargosService.crear(dto).subscribe({
      next: (nuevo) => {
        this.guardando.set(false);
        this.toastService.success(`Cargo "${nuevo.nombre}" creado`);
        this.router.navigate(['/cargos', nuevo.id]);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400) {
          this.toastService.error(`Datos inválidos: ${err?.error?.message || 'revisá el formulario'}`);
        } else {
          this.toastService.error(this.mensajeError(err));
        }
      }
    });
  }

  private actualizar(): void {
    const id = this.cargoId();
    if (id === null) return;

    const raw = this.form.value;
    const cambios: Partial<CargoRequest> = {};

    for (const key of Object.keys(this.originales)) {
      const nuevo = this.normalizar(key, raw[key]);
      const viejo = this.normalizar(key, this.originales[key]);
      if (nuevo !== viejo) {
        (cambios as Record<string, unknown>)[key] = nuevo;
      }
    }

    if (Object.keys(cambios).length === 0) {
      this.guardando.set(false);
      this.router.navigate(['/cargos', id]);
      return;
    }

    this.cargosService.actualizar(id, cambios).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.success(`Cargo "${this.form.get('nombre')?.value}" actualizado`);
        this.router.navigate(['/cargos', id]);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400) {
          this.toastService.error(`Datos inválidos: ${err?.error?.message || 'revisá el formulario'}`);
        } else if (err.status === 404) {
          this.toastService.error('Cargo no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
      }
    });
  }

  private normalizar(key: string, valor: unknown): unknown {
    if (key === 'salarioBase') {
      return valor === null || valor === '' ? null : Number(valor);
    }
    return valor;
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  campoCambiado(nombre: string): boolean {
    const c = this.form.get(nombre);
    if (!c || !this.modoEdicion()) return false;
    const nuevo = this.normalizar(nombre, c.value);
    const viejo = this.normalizar(nombre, this.originales[nombre]);
    return nuevo !== viejo;
  }

  cancelar(): void {
    if (this.modoEdicion() && this.cargoId() !== null) {
      this.router.navigate(['/cargos', this.cargoId()]);
    } else {
      this.router.navigate(['/cargos']);
    }
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
