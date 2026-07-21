import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
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
import { PAISES, Pais, aE164, fromE164 } from '../../../models/paises';
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
  readonly paises = PAISES;

  /** Estado del dropdown de países (controlado por Angular, no por Bootstrap JS). */
  readonly dropdownPaisAbierto = signal(false);

  readonly filtroPais = signal('');
  readonly paisesFiltrados = computed<Pais[]>(() => {
    const q = this.filtroPais().trim().toLowerCase();
    if (!q) return this.paises;
    return this.paises.filter((p) => {
      const base = `${p.name} ${p.code} +${p.dialCode}`.toLowerCase();
      const extras = (p.searchTerms ?? []).join(' ').toLowerCase();
      return base.includes(q) || extras.includes(q);
    });
  });

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

  private telefonoCompleto(): string | undefined {
    const codigo = this.form?.get('codigoPais')?.value as string | null;
    const numero = (this.form?.get('numeroLocal')?.value as string | null) ?? '';
    if (!numero) return undefined;
    const p = this.paises.find((x) => x.dialCode === codigo) ?? this.paises[0];
    return aE164(p.dialCode, numero);
  }

  /**
   * Helpers para la vista (template).
   */
  codigoPreferido(telefono: string | null | undefined): string {
    return fromE164(telefono).dialCode;
  }

  /** Devuelve el país cuyo dialCode matchea el código seleccionado, o null. */
  paisActual(dialCode: string | null | undefined): Pais | null {
    if (!dialCode) return null;
    return this.paises.find((p) => p.dialCode === dialCode) ?? null;
  }

  /**
   * Llamado por el template cuando el usuario elige un país de la lista
   * filtrable: cierra el panel y actualiza el form.
   */
  seleccionarPais(dialCode: string): void {
    this.form.get('codigoPais')?.setValue(dialCode);
    this.filtroPais.set('');
    this.dropdownPaisAbierto.set(false);
  }

  /** Alterna el panel del dropdown de países. */
  toggleDropdownPais(): void {
    this.dropdownPaisAbierto.update(v => !v);
  }

  /**
   * Cierra el dropdown si el click ocurre fuera del contenedor del teléfono.
   * Se bindea al document, así que cualquier click en la página cierra el panel.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownPaisAbierto()) return;
    const target = event.target as Element | null;
    // Si el click está dentro del contenedor del dropdown de países, no cerrar.
    if (target?.closest('.pais-dropdown-container')) return;
    this.dropdownPaisAbierto.set(false);
  }

  /** Cierra con Escape. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dropdownPaisAbierto()) {
      this.dropdownPaisAbierto.set(false);
    }
  }

  readonly jefesFiltrados = computed<Empleado[]>(() => {
    const todos = this.candidatosJefe();
    const empleadoActual = this.empleado();
    const empleadoActualId = this.empleadoId();
    const deptoForm = this.form?.get('departamentoId')?.value as number | null;

    // Filtro 1: nunca el mismo empleado (defensa en profundidad;
    // el backend ya lo excluye vía excludeId, pero por si cambia el flujo).
    let resultado = todos.filter(e => e.id !== empleadoActualId);

    const deptoFiltro = empleadoActual?.departamentoId ?? deptoForm ?? null;

    if (deptoFiltro === null) {
      return resultado;
    }
    // Filtro 2: mismo departamento, o el CEO de la empresa.
    resultado = resultado.filter(
      e => e.departamentoId === deptoFiltro || e.cargo?.nombre === 'CEO'
    );
    return resultado;
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
      // El campo real que se guarda en BD es `telefono` (E.164).
      // En la UI se divide en dos: codigoPais (+código país) + numeroLocal.
      telefono: [''],
      codigoPais: ['54'],                // Argentina por defecto
      numeroLocal: [''],
      fechaIngreso: ['', [Validators.required]],
      estado: ['activo' as EstadoEmpleado, [Validators.required]],
      departamentoId: [null as number | null, [Validators.required, Validators.min(1)]],
      cargoId: [null as number | null, [Validators.required, Validators.min(1)]],
      jefeId: [null as number | null]
    });

    // Mantener sincronizado el campo "telefono" (E.164) cuando cambian
    // codigoPais o numeroLocal. No se renderiza en la UI.
    this.form.get('codigoPais')!.valueChanges.subscribe(() => this.syncTelefonoCompleto());
    this.form.get('numeroLocal')!.valueChanges.subscribe(() => this.syncTelefonoCompleto());
  }

  private syncTelefonoCompleto(): void {
    const compl = this.telefonoCompleto();
    this.form.get('telefono')?.setValue(compl ?? '', { emitEvent: false });
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
      // Excluimos al empleado actual de la lista de candidatos a jefe.
      candidatosJefe: this.empleadoService.listarCandidatosJefe(id)
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
    // Parsear el teléfono guardado en E.164 a país + número local.
    const { dialCode, numeroLocal } = fromE164(emp.telefono);

    const valoresActuales = {
      cedula: emp.cedula,
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      telefono: emp.telefono ?? '',
      codigoPais: dialCode,
      numeroLocal: numeroLocal,
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
      telefono: (raw.telefono as string) || undefined,
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
        } else if (err.status === 409) {
          this.toastService.error(err?.error?.message || 'Conflicto con un valor existente');
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
