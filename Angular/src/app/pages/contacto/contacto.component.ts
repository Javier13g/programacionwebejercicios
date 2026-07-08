import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  private readonly fb = inject(FormBuilder);

  readonly enviado = signal(false);
  readonly cargando = signal(false);

  readonly form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    asunto: ['', [Validators.required, Validators.minLength(5)]],
    mensaje: ['', [Validators.required, Validators.minLength(20)]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    setTimeout(() => {
      this.cargando.set(false);
      this.enviado.set(true);
      this.form.reset();
      setTimeout(() => this.enviado.set(false), 4000);
    }, 500);
  }

  ctrl(name: string) {
    return this.form.get(name);
  }
  tieneError(name: string, err: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.touched && !!c.errors?.[err];
  }
}
