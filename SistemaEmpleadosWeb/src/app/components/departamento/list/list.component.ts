import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { DepartamentosService } from '../../../services/departamentos.service';
import { ToastService } from '../../../services/toast.service';
import { Departamento, PageResponse } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-departamento-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class DepartamentoListComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly departamentosService = inject(DepartamentosService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly departamentos = signal<Departamento[]>([]);
  readonly cargando = signal(true);

  readonly paginaActual = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly tamanioPagina = 10;

  // --- Búsqueda ---
  readonly busqueda = signal<string>('');
  private readonly busquedaInput$ = new Subject<string>();
  private sub?: Subscription;
  valorInput = '';

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

  limpiarBusqueda(): void {
    this.valorInput = '';
    this.busqueda.set('');
    this.paginaActual.set(0);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.departamentosService.listar(this.paginaActual(), this.tamanioPagina, this.busqueda()).subscribe({
      next: (resp: PageResponse<Departamento>) => {
        this.departamentos.set(resp.content);
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
