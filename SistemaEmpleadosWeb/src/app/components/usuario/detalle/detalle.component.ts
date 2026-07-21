import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { ToastService } from '../../../services/toast.service';
import { Usuario } from '../../../models/empleado';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class UsuarioDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toastService = inject(ToastService);

  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.toastService.error('ID de usuario inválido');
      this.cargando.set(false);
      return;
    }

    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.usuariosService.obtener(id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastService.error('Usuario no encontrado');
        } else {
          this.toastService.error(this.mensajeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }

  private mensajeError(err: any): string {
    if (err.status === 0) return 'No se pudo conectar con el backend (¿puerto 8080?)';
    return `Error ${err.status}: ${err?.error?.message || err.message}`;
  }
}
