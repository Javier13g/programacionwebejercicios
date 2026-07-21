import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly passwordReset = inject(PasswordResetService);
  private readonly toastService = inject(ToastService);

  /** Pre-cargado desde el query param si el usuario viene de /recuperar-password. */
  readonly telefono = signal<string>('');
  readonly codigo = signal<string>('');
  readonly newPassword = signal<string>('');
  readonly confirmPassword = signal<string>('');
  readonly cargando = signal(false);
  readonly completado = signal(false);

  ngOnInit(): void {
    // Si viene con query param, lo pre-cargamos para evitar que el usuario
    // lo tipee de nuevo.
    const telefono = this.route.snapshot.queryParamMap.get('telefono');
    if (telefono) {
      this.telefono.set(telefono);
    }
  }

  /**
   * Si el usuario perdió el código, puede volver a pedir uno nuevo.
   */
  reenviarCodigo(): void {
    const value = this.telefono().trim();
    if (!value) {
      this.toastService.warning('Ingresá tu teléfono para reenviar el código.');
      return;
    }
    this.cargando.set(true);
    this.passwordReset.forgotPasswordSms(value).subscribe({
      next: () => {
        this.cargando.set(false);
        this.toastService.success('Si el teléfono está registrado, recibirás un código nuevo.');
      },
      error: () => {
        this.cargando.set(false);
        this.toastService.error('No se pudo reenviar el código. Intentá nuevamente.');
      }
    });
  }

  enviar(): void {
    const tel = this.telefono().trim();
    const cod = this.codigo().trim();
    const np = this.newPassword();
    const cp = this.confirmPassword();

    if (!tel || !/^\+[1-9]\d{6,14}$/.test(tel)) {
      this.toastService.warning('Teléfono inválido (usá formato +códigopaís+número).');
      return;
    }
    if (!cod || cod.length !== 6 || !/^\d{6}$/.test(cod)) {
      this.toastService.warning('Ingresá el código de 6 dígitos que recibiste por SMS.');
      return;
    }
    if (!np || np.length < 6) {
      this.toastService.warning('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (np !== cp) {
      this.toastService.warning('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);
    this.passwordReset.resetPasswordByCode(tel, cod, np).subscribe({
      next: (resp) => {
        this.cargando.set(false);
        this.completado.set(true);
        this.toastService.success(resp.message || 'Contraseña actualizada.');
        // Breve delay para que vea el toast antes de cambiar de pantalla.
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err?.error?.message;
        if (err.status === 400) {
          this.toastService.error(
            msg || 'El código es inválido, expiró, ya fue utilizado o superaste los intentos.'
          );
        } else if (err.status === 0) {
          this.toastService.error('No se pudo conectar con el backend.');
        } else {
          this.toastService.error(msg || `Error ${err.status}`);
        }
      }
    });
  }
}
