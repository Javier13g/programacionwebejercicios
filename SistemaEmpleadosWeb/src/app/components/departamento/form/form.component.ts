import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DepartamentosService } from '../../../services/departamentos.service';
import { ToastService } from '../../../services/toast.service';
import { Departamento } from '../../../models/empleado';
import { DepartamentoRequest } from '../../../models/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-departamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class DepartamentoFormComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly departamentosService = inject(DepartamentosService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly modoEdicion = signal(false);
  readonly departamentoId = signal<number | null>(null);
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
        this.toastService.error('ID de departamento inválido');
        this.cargando.set(false);
        return;
      }
      this.modoEdicion.set(true);
      this.departamentoId.set(id);
      this.cargar(id);
    } else {
      this.modoEdicion.set(false);
      this.cargando.set(false);
    }
  }

  private inicializarForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      jefeId: [null as number | null, [Validators.min(1)]]
    });
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.departamentosService.obtener(id).subscribe({
      next: (d: Departamento) => {
        const valores = {
          nombre: d.nombre,
          descripcion: d.descripcion ?? '',
          jefeId: d.jefe?.id ?? null
        };
        this.form.patchValue(valores);
        this.originales = { ...valores };
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Departamento no encontrado');
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
    const dto: DepartamentoRequest = {
      nombre: raw.nombre,
      descripcion: raw.descripcion || undefined,
      jefeId: raw.jefeId ? Number(raw.jefeId) : undefined
    };

    this.departamentosService.crear(dto).subscribe({
      next: (nuevo) => {
        this.guardando.set(false);
        this.toastService.success(`Departamento "${nuevo.nombre}" creado`);
        this.router.navigate(['/departamentos', nuevo.id]);
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
    const id = this.departamentoId();
    if (id === null) return;

    const raw = this.form.value;
    const cambios: Partial<DepartamentoRequest> = {};

    for (const key of Object.keys(this.originales)) {
      const nuevo = this.normalizar(key, raw[key]);
      const viejo = this.normalizar(key, this.originales[key]);
      if (nuevo !== viejo) {
        (cambios as Record<string, unknown>)[key] = nuevo;
      }
    }

    if (Object.keys(cambios).length === 0) {
      this.guardando.set(false);
      this.router.navigate(['/departamentos', id]);
      return;
    }

    this.departamentosService.actualizar(id, cambios).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.success(`Departamento "${this.form.get('nombre')?.value}" actualizado`);
        this.router.navigate(['/departamentos', id]);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400) {
          this.toastService.error(`Datos inválidos: ${err?.error?.message || 'revisá el formulario'}`);
        } else if (err.status === 404) {
          this.toastService.error('Departamento no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
      }
    });
  }

  private normalizar(key: string, valor: unknown): unknown {
    if (valor === '' || valor === undefined) return null;
    if (key === 'jefeId') {
      return valor === null ? null : Number(valor);
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
    if (this.modoEdicion() && this.departamentoId() !== null) {
      this.router.navigate(['/departamentos', this.departamentoId()]);
    } else {
      this.router.navigate(['/departamentos']);
    }
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
