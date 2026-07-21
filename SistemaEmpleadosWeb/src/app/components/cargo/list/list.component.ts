import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CargosService } from '../../../services/cargos.service';
import { ToastService } from '../../../services/toast.service';
import { Cargo, PageResponse } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-cargo-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NavbarComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class CargoListComponent implements OnInit {
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

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.cargosService.listar(this.paginaActual(), this.tamanioPagina).subscribe({
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
