import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { UtilidadesService } from '../../services/utilidades.service';
import { DescuentoPipe } from '../../pipes/descuento.pipe';

interface Orden {
  numero: string;
  fecha: string;
  total: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DescuentoPipe,
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
  ],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  readonly carrito = inject(CarritoService);
  readonly utils = inject(UtilidadesService);

  readonly ordenConfirmada = signal<Orden | null>(null);

  readonly descuento = computed(() => {
    const sub = this.carrito.subtotal();
    if (sub > 50000) return 20;
    if (sub > 25000) return 10;
    return 0;
  });

  readonly pasos = computed(() =>
    Math.min(this.carrito.cantidad() * 2, 10),
  );

  vaciar(): void {
    if (confirm('¿Está seguro de vaciar el carrito?')) {
      this.carrito.vaciar();
    }
  }

  finalizar(): void {
    const orden = this.carrito.finalizarCompra();
    if (orden) {
      this.ordenConfirmada.set({
        numero: orden.numero,
        fecha: orden.fecha,
        total: orden.total,
      });
    }
  }

  eliminar(id: number): void {
    this.carrito.eliminar(id);
  }

  cambiarCantidad(id: number, cantidad: number): void {
    this.carrito.actualizarCantidad(id, cantidad);
  }
}
