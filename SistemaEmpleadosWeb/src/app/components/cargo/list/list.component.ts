import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { CargosService } from '../../../services/cargos.service';
import { ToastService } from '../../../services/toast.service';
import { Cargo, PageResponse } from '../../../models/empleado';
import { NIVELES_CARGO, NivelCargo } from '../../../models/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-cargo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class CargoListComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly cargosService = inject(CargosService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly cargos = signal<Cargo[]>([]);
  readonly cargando = signal(true);

  readonly paginaActual = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly tamanioPagina = 5;

  // --- Filtros ---
  readonly busqueda = signal<string>('');
  readonly nivelSeleccionado = signal<NivelCargo | null>(null);

  private readonly busquedaInput$ = new Subject<string>();
  private sub?: Subscription;
  valorInput = '';

  readonly niveles = NIVELES_CARGO;

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

  onNivelChange(value: string): void {
    // '' = sin filtro
    this.nivelSeleccionado.set(value ? (value as NivelCargo) : null);
    this.paginaActual.set(0);
    this.cargar();
  }

  limpiarBusqueda(): void {
    this.valorInput = '';
    this.busqueda.set('');
    this.paginaActual.set(0);
    this.cargar();
  }

  limpiarNivel(): void {
    this.nivelSeleccionado.set(null);
    this.paginaActual.set(0);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.cargosService.listar(
      this.paginaActual(),
      this.tamanioPagina,
      this.busqueda(),
      this.nivelSeleccionado()
    ).subscribe({
      next: (resp: PageResponse<Cargo>) => {
        this.cargos.set(resp.content);
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

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
