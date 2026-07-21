import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CargosService } from '../../../services/cargos.service';
import { ToastService } from '../../../services/toast.service';
import { Cargo } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-cargo-detalle',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NavbarComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class CargoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cargosService = inject(CargosService);
  private readonly toastService = inject(ToastService);

  readonly cargo = signal<Cargo | null>(null);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.toastService.error('ID de cargo inválido');
      this.cargando.set(false);
      return;
    }

    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.cargosService.obtener(id).subscribe({
      next: (c) => {
        this.cargo.set(c);
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Cargo no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/cargos']);
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
