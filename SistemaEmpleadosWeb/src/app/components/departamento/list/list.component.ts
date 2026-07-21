import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DepartamentosService } from '../../../services/departamentos.service';
import { ToastService } from '../../../services/toast.service';
import { Departamento, PageResponse } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-departamento-list',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class DepartamentoListComponent implements OnInit {
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

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.departamentosService.listar(this.paginaActual(), this.tamanioPagina).subscribe({
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
