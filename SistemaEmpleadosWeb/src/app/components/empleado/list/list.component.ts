import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { ToastService } from '../../../services/toast.service';
import { Empleado, PageResponse } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class EmpleadoListComponent implements OnInit {
  private readonly empleadoService = inject(EmpleadoService);
  private readonly toastService = inject(ToastService);

  readonly empleados = signal<Empleado[]>([]);
  readonly cargando = signal(true);

  readonly paginaActual = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly tamanioPagina = 20;

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.cargando.set(true);

    this.empleadoService.listar(this.paginaActual(), this.tamanioPagina).subscribe({
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
