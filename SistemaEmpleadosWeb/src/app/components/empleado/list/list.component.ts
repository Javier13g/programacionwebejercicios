import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmpleadoService } from '../../../services/empleado.service';
import { ToastService } from '../../../services/toast.service';
import { Empleado, PageResponse } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class EmpleadoListComponent implements OnInit, OnDestroy {
  private readonly empleadoService = inject(EmpleadoService);
  private readonly toastService = inject(ToastService);

  readonly empleados = signal<Empleado[]>([]);
  readonly cargando = signal(true);

  readonly paginaActual = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly tamanioPagina = 20;

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
      this.cargarEmpleados();
    });

    this.cargarEmpleados();
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
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.cargando.set(true);

    this.empleadoService.listar(this.paginaActual(), this.tamanioPagina, this.busqueda()).subscribe({
      next: (resp: PageResponse<Empleado>) => {
        this.empleados.set(resp.content);
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

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }

  irAPagina(p: number): void {
    if (p < 0 || p >= this.totalPaginas()) return;
    this.paginaActual.set(p);
    this.cargarEmpleados();
  }
}
