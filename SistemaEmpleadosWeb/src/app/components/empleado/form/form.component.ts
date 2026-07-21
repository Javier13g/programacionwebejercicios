import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { DepartamentosService } from '../../../services/departamentos.service';
import { CargosService } from '../../../services/cargos.service';
import { ToastService } from '../../../services/toast.service';
import { Cargo, Departamento, Empleado } from '../../../models/empleado';
import { EmpleadoRequest, ESTADOS_EMPLEADO, EstadoEmpleado } from '../../../models/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class EmpleadoFormComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly departamentosService = inject(DepartamentosService);
  private readonly cargosService = inject(CargosService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly estados = ESTADOS_EMPLEADO;

  readonly modoEdicion = signal(false);
  readonly empleadoId = signal<number | null>(null);
  readonly empleado = signal<Empleado | null>(null);
  readonly departamentos = signal<Departamento[]>([]);
  readonly cargos = signal<Cargo[]>([]);
  readonly candidatosJefe = signal<Empleado[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);

  form!: FormGroup;
  private originales: Record<string, unknown> = {};


  readonly jefesFiltrados = computed<Empleado[]>(() => {
    const todos = this.candidatosJefe();
    const empleadoActual = this.empleado();
    const deptoForm = this.form?.get('departamentoId')?.value as number | null;

    const deptoFiltro = empleadoActual?.departamentoId ?? deptoForm ?? null;

    if (deptoFiltro === null) {
      return todos;
    }
    return todos.filter(
      e => e.departamentoId === deptoFiltro || e.cargo?.nombre === 'CEO'
    );
  });

  ngOnInit(): void {
    this.inicializarForm();

    const idParam = this.route.snapshot.paramMap.get('id');

    // Modo creación: sin :id, o :id === 'nuevo'
    if (!idParam || idParam === 'nuevo') {
      this.modoEdicion.set(false);
      this.cargarCombos();
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      this.toastService.error('ID de empleado inválido');
      this.cargando.set(false);
      return;
    }

    this.modoEdicion.set(true);
    this.empleadoId.set(id);
    this.cargarDatos(id);
  }

  private inicializarForm(): void {
    this.form = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      fechaIngreso: ['', [Validators.required]],
      estado: ['activo' as EstadoEmpleado, [Validators.required]],
      departamentoId: [null as number | null, [Validators.required, Validators.min(1)]],
      cargoId: [null as number | null, [Validators.required, Validators.min(1)]],
      jefeId: [null as number | null]
    });
  }

  private cargarCombos(): void {
    this.cargando.set(true);

    forkJoin({
      departamentos: this.departamentosService.listar(),
      cargos: this.cargosService.listar(),
      candidatosJefe: this.empleadoService.listarCandidatosJefe()
    }).subscribe({
      next: ({ departamentos, cargos, candidatosJefe }) => {
        this.departamentos.set(departamentos.content);
        this.cargos.set(cargos.content);
        this.candidatosJefe.set(candidatosJefe);
        this.cargando.set(false);
      },
      error: (err) => {
        this.toastService.error(this.mensajeError(err));
        this.cargando.set(false);
      }
    });
  }

  private cargarDatos(id: number): void {
    this.cargando.set(true);

    forkJoin({
      empleado: this.empleadoService.obtener(id),
      departamentos: this.departamentosService.listar(),
      cargos: this.cargosService.listar(),
      candidatosJefe: this.empleadoService.listarCandidatosJefe()
    }).subscribe({
      next: ({ empleado, departamentos, cargos, candidatosJefe }) => {
        this.empleado.set(empleado);
        this.departamentos.set(departamentos.content);
        this.cargos.set(cargos.content);
        this.candidatosJefe.set(candidatosJefe);
        this.rellenarFormulario(empleado);
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Empleado no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  private rellenarFormulario(emp: Empleado): void {
    const valoresActuales = {
      cedula: emp.cedula,
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      telefono: emp.telefono ?? '',
      fechaIngreso: emp.fechaIngreso,
      estado: (emp.estado as EstadoEmpleado) || 'activo',
      departamentoId: emp.departamentoId ?? emp.departamento?.id ?? null,
      cargoId: emp.cargoId ?? emp.cargo?.id ?? null,
      jefeId: emp.jefeId ?? null
    };

    this.form.patchValue(valoresActuales);
    this.originales = { ...valoresActuales };
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
    const dto: EmpleadoRequest = {
      cedula: raw.cedula,
      nombre: raw.nombre,
      apellido: raw.apellido,
      email: raw.email,
      telefono: raw.telefono || undefined,
      fechaIngreso: raw.fechaIngreso,
      estado: raw.estado,
      departamentoId: Number(raw.departamentoId),
      cargoId: Number(raw.cargoId),
      jefeId: raw.jefeId ? Number(raw.jefeId) : undefined
    };

    this.empleadoService.crear(dto).subscribe({
      next: (nuevo) => {
        this.guardando.set(false);
        this.toastService.success(`Empleado "${nuevo.nombre} ${nuevo.apellido}" creado`);
        this.router.navigate(['/empleados', nuevo.id]);
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
    const id = this.empleadoId();
    if (id === null) return;

    const raw = this.form.value;
    const cambios: Partial<EmpleadoRequest> = {};

    for (const key of Object.keys(this.originales)) {
      const nuevo = this.normalizar(key, raw[key]);
      const viejo = this.normalizar(key, this.originales[key]);
      if (nuevo !== viejo) {
        (cambios as Record<string, unknown>)[key] = nuevo;
      }
    }

    if (Object.keys(cambios).length === 0) {
      this.guardando.set(false);
      this.router.navigate(['/empleados', id]);
      return;
    }

    this.empleadoService.actualizar(id, cambios).subscribe({
      next: () => {
        this.guardando.set(false);
        const nombre = `${this.form.get('nombre')?.value} ${this.form.get('apellido')?.value}`;
        this.toastService.success(`Empleado "${nombre}" actualizado`);
        this.router.navigate(['/empleados', id]);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400) {
          this.toastService.error(`Datos inválidos: ${err?.error?.message || 'revisá el formulario'}`);
        } else if (err.status === 404) {
          this.toastService.error('Empleado no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
      }
    });
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    const msg = err?.error?.message;
    return `Error ${err.status}: ${msg || err.message}`;
  }

  private normalizar(key: string, valor: unknown): unknown {
    if (valor === '' || valor === undefined) return null;
    if (key === 'departamentoId' || key === 'cargoId' || key === 'jefeId') {
      return valor === null ? null : Number(valor);
    }
    if (key === 'estado' && typeof valor === 'string') {
      return valor.toLowerCase();
    }
    return valor;
  }

  cancelar(): void {
    if (this.modoEdicion() && this.empleadoId() !== null) {
      this.router.navigate(['/empleados', this.empleadoId()]);
    } else {
      this.router.navigate(['/']);
    }
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  campoCambiado(nombre: string): boolean {
    // En modo creación no hay "originales", así que todo es "nuevo"
    if (!this.modoEdicion()) return false;
    const c = this.form.get(nombre);
    if (!c) return false;
    const nuevo = this.normalizar(nombre, c.value);
    const viejo = this.normalizar(nombre, this.originales[nombre]);
    return nuevo !== viejo;
  }
}
