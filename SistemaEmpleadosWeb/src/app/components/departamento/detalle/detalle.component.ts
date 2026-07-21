import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DepartamentosService } from '../../../services/departamentos.service';
import { ToastService } from '../../../services/toast.service';
import { Departamento } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-departamento-detalle',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DepartamentoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly departamentosService = inject(DepartamentosService);
  private readonly toastService = inject(ToastService);

  readonly departamento = signal<Departamento | null>(null);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.toastService.error('ID de departamento inválido');
      this.cargando.set(false);
      return;
    }

    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.departamentosService.obtener(id).subscribe({
      next: (d) => {
        this.departamento.set(d);
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Departamento no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/departamentos']);
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
