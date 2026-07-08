import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { UtilidadesService } from '../../services/utilidades.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

interface DatosCheckout {
  subtotal: number;
  impuestos: number;
  envio: number;
  total: number;
}

interface OrdenConfirmada {
  numero: string;
  fecha: string;
  datos: DatosCheckout;
  items: { id: number; nombre: string; cantidad: number; precio: number }[];
  comprador: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    metodoPago: string;
  };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, UpperCasePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly carrito = inject(CarritoService);
  readonly utils = inject(UtilidadesService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly envio = signal(1500); // costo de envío fijo en RD$

  readonly form: FormGroup = this.fb.group({
    // --- Datos del comprador ---
    nombre: [
      '',
      [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
    telefono: [
      '',
      [Validators.required, Validators.pattern(/^[0-9\-\+\(\)\s]{7,15}$/)],
    ],
    direccion: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(200)],
    ],
    ciudad: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    codigoPostal: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]{4,8}$/)],
    ],
    // --- Pago ---
    metodoPago: ['tarjeta', [Validators.required]],
    // Los campos de tarjeta inician SIN validadores; se añaden
    // dinámicamente cuando se elige el método "tarjeta" y se quitan
    // cuando se elige "efectivo" para que el botón se habilite.
    numeroTarjeta: [''],
    nombreTarjeta: [''],
    vencimiento: [''],
    cvv: [''],
    // --- Términos ---
    aceptaTerminos: [false, [Validators.requiredTrue]],
  });

  readonly ordenGenerada = signal<OrdenConfirmada | null>(null);
  readonly enviando = signal(false);

  /** Lista de controles de tarjeta (necesarios para activar/desactivar). */
  private readonly tarjetaKeys = ['numeroTarjeta', 'nombreTarjeta', 'vencimiento', 'cvv'] as const;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Si el carrito está vacío, redirige al catálogo
    if (this.carrito.vacio()) {
      this.router.navigate(['/productos']);
      return;
    }

    // Aplicar validadores según método por defecto
    this.aplicarValidacionesTarjeta('tarjeta');

    // Reaccionar a cambios del método de pago en vivo
    this.form.get('metodoPago')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((metodo) => this.aplicarValidacionesTarjeta(metodo));

    // Pre-rellenar email si hay sesión
    const usuario = this.auth.usuario();
    if (usuario) {
      this.form.patchValue({
        nombre: usuario.nombre,
        email: usuario.email,
      });
    }
  }

  /** Limpia suscripciones al destruir. */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Activa/desactiva los validadores de los campos de tarjeta y
   * los deja limpios cuando el método es "Contra entrega" para
   * que el form sea válido.
   */
  private aplicarValidacionesTarjeta(metodo: string): void {
    const esTarjeta = metodo === 'tarjeta';

    this.tarjetaKeys.forEach((key) => {
      const ctrl = this.form.get(key);
      if (!ctrl) return;

      this.clearValidators(ctrl);

      if (esTarjeta) {
        switch (key) {
          case 'numeroTarjeta':
            ctrl.addValidators([Validators.required, Validators.pattern(/^[0-9]{13,19}$/)]);
            break;
          case 'nombreTarjeta':
            ctrl.addValidators([Validators.required, Validators.minLength(3)]);
            break;
          case 'vencimiento':
            ctrl.addValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)]);
            break;
          case 'cvv':
            ctrl.addValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
            break;
        }
      } else {
        // Contra entrega → vaciamos los campos
        ctrl.setValue('', { emitEvent: false });
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });

    // Forzar recálculo global
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private clearValidators(ctrl: import('@angular/forms').AbstractControl): void {
    ctrl.clearValidators();
  }

  /** Habilita/deshabilita campos de tarjeta según método de pago. */
  get esTarjeta(): boolean {
    return this.form.get('metodoPago')?.value === 'tarjeta';
  }

  // --- Helpers de acceso al form en el template ---
  get f() {
    return this.form.controls as Record<string, import('@angular/forms').FormControl>;
  }
  ctrl(name: string): import('@angular/forms').FormControl {
    return this.form.get(name) as import('@angular/forms').FormControl;
  }
  tieneError(name: string, err: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.touched && !!c.errors?.[err];
  }

  resumen(): DatosCheckout {
    const subtotal = this.carrito.subtotal();
    const impuestos = this.carrito.impuestos();
    const envio = subtotal > 25000 ? 0 : this.envio();
    return {
      subtotal,
      impuestos,
      envio,
      total: subtotal + impuestos + envio,
    };
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.carrito.vacio()) return;

    this.enviando.set(true);

    // Simula latencia de procesamiento
    setTimeout(() => {
      const resumen = this.resumen();
      const datos = this.form.value;
      const orden: OrdenConfirmada = {
        numero: this.utils.generarNumeroOrden('GAME'),
        fecha: new Date().toISOString(),
        datos: resumen,
        items: this.carrito.items().map((i) => ({
          id: i.id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio: i.precio,
        })),
        comprador: {
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono,
          direccion: `${datos.direccion}, ${datos.ciudad} (${datos.codigoPostal})`,
          metodoPago: datos.metodoPago,
        },
      };
      this.ordenGenerada.set(orden);
      this.utils.guardar('gamestore_ultima_orden', orden);
      this.carrito.vaciar();
      this.enviando.set(false);
    }, 600);
  }
}
