import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly passwordReset = inject(PasswordResetService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly telefono = signal('');
  readonly cargando = signal(false);
  readonly enviado = signal(false);

  enviar(): void {
    const value = this.telefono().trim();
    if (!value || !this.esTelefonoE164Valido(value)) {
      this.toastService.warning('Ingresá el teléfono en formato internacional (+5491145551234)');
      return;
    }

    this.cargando.set(true);
    this.passwordReset.forgotPasswordSms(value).subscribe({
      next: (resp) => {
        this.cargando.set(false);
        this.enviado.set(true);
        this.toastService.success(
          resp.message || 'Si el teléfono está registrado, recibirás un código de 6 dígitos.'
        );
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err?.error?.message;
        if (err.status === 0) {
          this.toastService.error('No se pudo conectar con el backend.');
        } else {
          this.toastService.error(msg || `Error ${err.status}`);
        }
      }
    });
  }

  private esTelefonoE164Valido(telefono: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(telefono);
  }

  irACodigo(): void {
    // Mantiene el teléfono tipeado para que el componente de validación
    // no se lo pida de nuevo (UX).
    this.router.navigate(['/reset-password'], {
      queryParams: { telefono: this.telefono().trim() }
    });
  }
}
