import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { ToastService } from '../../../services/toast.service';
import { Empleado, PageResponse, Usuario } from '../../../models/empleado';
import { UsuarioRequest, ROLES_USUARIO, RolUsuario } from '../../../models/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class UsuarioFormComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuariosService = inject(UsuariosService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly roles = ROLES_USUARIO;
  readonly modoEdicion = signal(false);
  readonly usuarioId = signal<number | null>(null);
  readonly empleados = signal<Empleado[]>([]);
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
        this.toastService.error('ID de usuario inválido');
        this.cargando.set(false);
        return;
      }
      this.modoEdicion.set(true);
      this.usuarioId.set(id);
      this.cargarDatos(id);
    } else {
      this.modoEdicion.set(false);
      this.cargarEmpleados();
    }
  }

  private inicializarForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: [''],
      rol: ['empleado' as RolUsuario, [Validators.required]],
      empleadoId: [null as number | null, [Validators.required, Validators.min(1)]]
    });
  }

  private cargarDatos(id: number): void {
    this.cargando.set(true);
    forkJoin({
      usuario: this.usuariosService.obtener(id),
      empleados: this.empleadoService.listar(0, 200)
    }).subscribe({
      next: ({ usuario, empleados }) => {
        this.empleados.set(empleados.content);
        this.rellenarFormulario(usuario);
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Usuario no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  private cargarEmpleados(): void {
    this.cargando.set(true);
    this.empleadoService.listar(0, 200).subscribe({
      next: (resp: PageResponse<Empleado>) => {
        this.empleados.set(resp.content);
        this.cargando.set(false);
      },
      error: (err) => {
        this.toastService.error(this.mensajeError(err));
        this.cargando.set(false);
      }
    });
  }

  private rellenarFormulario(u: Usuario): void {
    const valoresActuales = {
      username: u.username,
      password: '',
      rol: (u.rol as RolUsuario) || 'empleado',
      empleadoId: u.empleadoId ?? u.empleado?.id ?? null
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
    const password = (raw.password as string | undefined)?.trim();
    if (!password || password.length < 8) {
      this.guardando.set(false);
      this.toastService.error('La contraseña es obligatoria y debe tener al menos 8 caracteres.');
      this.form.get('password')?.markAsTouched();
      return;
    }

    const dto: UsuarioRequest = {
      username: raw.username,
      password,
      rol: raw.rol,
      empleadoId: Number(raw.empleadoId)
    };

    this.usuariosService.crear(dto).subscribe({
      next: (nuevo) => {
        this.guardando.set(false);
        this.toastService.success(`Usuario "${nuevo.username}" creado`);
        this.router.navigate(['/usuarios', nuevo.id]);
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
    const id = this.usuarioId();
    if (id === null) return;

    const raw = this.form.value;
    const password = (raw.password as string | undefined)?.trim();
    const cambios: Partial<UsuarioRequest> = {};

    for (const key of Object.keys(this.originales)) {
      if (key === 'password') continue;
      const nuevo = this.normalizar(key, raw[key]);
      const viejo = this.normalizar(key, this.originales[key]);
      if (nuevo !== viejo) {
        (cambios as Record<string, unknown>)[key] = nuevo;
      }
    }

    if (password && password.length > 0) {
      if (password.length < 8) {
        this.guardando.set(false);
        this.toastService.error('La contraseña debe tener al menos 8 caracteres.');
        this.form.get('password')?.markAsTouched();
        return;
      }
      cambios.password = password;
    }

    if (Object.keys(cambios).length === 0) {
      this.guardando.set(false);
      this.router.navigate(['/usuarios', id]);
      return;
    }

    this.usuariosService.actualizar(id, cambios).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.success(`Usuario "${this.form.get('username')?.value}" actualizado`);
        this.router.navigate(['/usuarios', id]);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400) {
          this.toastService.error(`Datos inválidos: ${err?.error?.message || 'revisá el formulario'}`);
        } else if (err.status === 404) {
          this.toastService.error('Usuario no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
      }
    });
  }

  private normalizar(key: string, valor: unknown): unknown {
    if (valor === '' || valor === undefined) return null;
    if (key === 'empleadoId') {
      return valor === null ? null : Number(valor);
    }
    if (key === 'rol' && typeof valor === 'string') {
      return valor.toLowerCase();
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
    if (this.modoEdicion() && this.usuarioId() !== null) {
      this.router.navigate(['/usuarios', this.usuarioId()]);
    } else {
      this.router.navigate(['/usuarios']);
    }
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
