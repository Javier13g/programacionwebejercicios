import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" [routerLink]="['/']">Sistema Empleados</a>
        <button
          class="navbar-toggler"
          type="button"
          (click)="abrir = !abrir"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [class.show]="abrir">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a
                class="nav-link"
                [routerLink]="['/']"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="abrir = false"
              >Empleados</a>
            </li>
            @if (puedeGestionar()) {
              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/departamentos']"
                  routerLinkActive="active"
                  (click)="abrir = false"
                >Departamentos</a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/cargos']"
                  routerLinkActive="active"
                  (click)="abrir = false"
                >Cargos</a>
              </li>
            }
            @if (esAdmin()) {
              <li class="nav-item">
                <a
                  class="nav-link"
                  [routerLink]="['/usuarios']"
                  routerLinkActive="active"
                  (click)="abrir = false"
                >Usuarios</a>
              </li>
            }
          </ul>
          <div class="d-flex align-items-center text-white-50">
            @if (user(); as u) {
              <span class="me-3">
                <i class="bi bi-person-circle me-1"></i>
                {{ u.username }}
                <span class="badge bg-info ms-1">{{ u.rol }}</span>
              </span>
            }
            <button class="btn btn-sm btn-outline-light" (click)="logout()">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly puedeGestionar = computed(() => {
    const rol = this.auth.user()?.rol;
    return rol === 'admin' || rol === 'rrhh';
  });
  readonly esAdmin = computed(() => this.auth.user()?.rol === 'admin');
  abrir = false;

  logout(): void {
    const username = this.user()?.username;
    this.auth.logout();
    this.toastService.info(`Sesión cerrada${username ? ` (${username})` : ''}`);
    this.router.navigate(['/login']);
  }
}
