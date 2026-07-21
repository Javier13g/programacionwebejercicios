import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { DepartamentosService } from '../../../services/departamentos.service';
import { ToastService } from '../../../services/toast.service';
import { Empleado } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-empleado-detalle',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NavbarComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class EmpleadoDetalleComponent implements OnInit {
  private readonly empleadoService = inject(EmpleadoService);
  private readonly departamentosService = inject(DepartamentosService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly empleado = signal<Empleado | null>(null);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.toastService.error('ID de empleado inválido');
      this.cargando.set(false);
      return;
    }

    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);

    this.empleadoService.obtener(id).subscribe({
      next: (emp) => {
        this.empleado.set(emp);

        if (emp.departamentoId && !emp.departamento) {
          this.cargarDepartamento(emp.departamentoId, id);
        } else {
          this.cargando.set(false);
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Empleado no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  private cargarDepartamento(departamentoId: number, empleadoId: number): void {
    this.departamentosService.obtener(departamentoId).subscribe({
      next: (dep) => {
        this.empleado.update(emp =>
          emp && emp.id === empleadoId ? { ...emp, departamento: dep } : emp
        );
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }

  volver(): void {
    this.router.navigate(['/']);
  }
}
