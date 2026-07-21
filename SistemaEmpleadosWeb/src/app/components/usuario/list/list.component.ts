import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmService } from '../../../services/confirm.service';
import { PageResponse, Usuario } from '../../../models/empleado';
import { ROLES_USUARIO, RolUsuario } from '../../../models/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class UsuarioListComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  readonly user = this.auth.user;
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly procesandoId = signal<number | null>(null);

  readonly paginaActual = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly tamanioPagina = 10;

  // --- Filtros ---
  readonly busqueda = signal<string>('');
  readonly rolSeleccionado = signal<RolUsuario | null>(null);
  /** Cuando está activo, muestra también usuarios deshabilitados. */
  readonly mostrarDeshabilitados = signal<boolean>(false);

  private readonly busquedaInput$ = new Subject<string>();
  private sub?: Subscription;
  valorInput = '';

  readonly roles = ROLES_USUARIO;

  ngOnInit(): void {
    this.sub = this.busquedaInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termino) => {
      this.busqueda.set(termino);
      this.paginaActual.set(0);
      this.cargar();
    });

    this.cargar();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onBuscarInput(value: string): void {
    this.valorInput = value;
    this.busquedaInput$.next(value);
  }

  onRolChange(value: string): void {
    this.rolSeleccionado.set(value ? (value as RolUsuario) : null);
    this.paginaActual.set(0);
    this.cargar();
  }

  limpiarBusqueda(): void {
    this.valorInput = '';
    this.busqueda.set('');
    this.paginaActual.set(0);
    this.cargar();
  }

  limpiarRol(): void {
    this.rolSeleccionado.set(null);
    this.paginaActual.set(0);
    this.cargar();
  }

  toggleMostrarDeshabilitados(): void {
    this.mostrarDeshabilitados.update(v => !v);
    this.paginaActual.set(0);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.usuariosService.listar(
      this.paginaActual(),
      this.tamanioPagina,
      this.busqueda(),
      this.rolSeleccionado(),
      this.mostrarDeshabilitados()
    ).subscribe({
      next: (resp: PageResponse<Usuario>) => {
        this.usuarios.set(resp.content);
        this.totalPaginas.set(resp.totalPages);
        this.totalElementos.set(resp.totalElements);
        this.cargando.set(false);
      },
      error: (err) => {
        this.toastService.error(this.mensajeError(err));
        this.cargando.set(false);
      }
    });
  }

  irAPagina(p: number): void {
    if (p < 0 || p >= this.totalPaginas()) return;
    this.paginaActual.set(p);
    this.cargar();
  }

  async deshabilitar(u: Usuario, event: Event): Promise<void> {
    event.stopPropagation();
    if (u.deleted) return;

    const username = u.username;
    const ok = await this.confirmService.ask({
      title: 'Deshabilitar usuario',
      message: `¿Deshabilitar el usuario "${username}"?\n\nNo podrá iniciar sesión hasta que lo habilites nuevamente.`,
      confirmText: 'Sí, deshabilitar',
      cancelText: 'Cancelar',
      variant: 'warning',
      icon: 'slash-circle'
    });
    if (!ok) return;

    this.procesandoId.set(u.id);
    this.usuariosService.cambiarEstado(u.id, true).subscribe({
      next: () => {
        this.toastService.success(`Usuario "${username}" deshabilitado`);
        this.procesandoId.set(null);
        this.cargar();
      },
      error: (err) => {
        this.toastService.error(this.mensajeError(err));
        this.procesandoId.set(null);
      }
    });
  }

  async habilitar(u: Usuario, event: Event): Promise<void> {
    event.stopPropagation();
    if (!u.deleted) return;

    const username = u.username;
    const ok = await this.confirmService.ask({
      title: 'Habilitar usuario',
      message: `¿Habilitar el usuario "${username}" nuevamente?`,
      confirmText: 'Sí, habilitar',
      cancelText: 'Cancelar',
      variant: 'success',
      icon: 'arrow-counterclockwise'
    });
    if (!ok) return;

    this.procesandoId.set(u.id);
    this.usuariosService.cambiarEstado(u.id, false).subscribe({
      next: () => {
        this.toastService.success(`Usuario "${username}" habilitado`);
        this.procesandoId.set(null);
        this.cargar();
      },
      error: (err) => {
        this.toastService.error(this.mensajeError(err));
        this.procesandoId.set(null);
      }
    });
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
