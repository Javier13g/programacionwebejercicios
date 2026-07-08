import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Página de login (mock).
 *
 * Usa ReactiveFormsModule + FormBuilder para validar email/contraseña.
 * Redirige a `?redirect=...` si existe, o al `/` por defecto.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly errorLogin = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.errorLogin.set(null);
    const { email, password } = this.form.value as { email: string; password: string };
    this.auth.login(email, password).subscribe({
      next: () => {
        this.cargando.set(false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/';
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorLogin.set(err?.message ?? 'No se pudo iniciar sesión');
      },
    });
  }

  // Helpers de acceso al form en el template
  get emailCtrl() {
    return this.form.get('email');
  }
  get passwordCtrl() {
    return this.form.get('password');
  }
}
