import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly username = signal('');
  readonly password = signal('');
  readonly cargando = signal(false);

  enviar(): void {
    if (!this.username() || !this.password()) {
      this.toastService.warning('Completá usuario y contraseña');
      return;
    }

    this.cargando.set(true);

    this.auth.login({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: (resp) => {
        this.cargando.set(false);
        if (resp.success) {
          this.toastService.success(`Bienvenido, ${resp.username}`);
          this.router.navigate(['/']);
        } else {
          this.toastService.error(resp.message || 'Credenciales inválidas');
        }
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err?.error?.message;
        if (err.status === 401) {
          this.toastService.error(msg || 'Usuario o contraseña incorrectos');
        } else if (err.status === 0) {
          this.toastService.error('No se pudo conectar con el backend (¿puerto 8080?)');
        } else {
          this.toastService.error(`Error ${err.status}: ${msg || err.message}`);
        }
      }
    });
  }
}
