import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UtilidadesService } from '../../services/utilidades.service';

interface OrdenHistorial {
  numero: string;
  fecha: string;
  datos: {
    subtotal: number;
    impuestos: number;
    envio: number;
    total: number;
  };
  items: { id: number; nombre: string; cantidad: number; precio: number }[];
  comprador?: { nombre: string; email: string };
}

/**
 * Página "Historial de compras" (protegida con authGuard).
 * Muestra las órdenes guardadas en `localStorage`.
 */
@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css',
})
export class HistorialComponent implements OnInit {
  private readonly utils = inject(UtilidadesService);

  readonly ordenes = signal<OrdenHistorial[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    // El service devuelve todo lo persistido bajo "gamestore_ultima_orden"
    // Para hacerlo más completo, leemos un array histórico.
    const arr = this.utils.leer<OrdenHistorial[]>('gamestore_historial', []);
    const ultima = this.utils.leer<OrdenHistorial | null>('gamestore_ultima_orden', null);
    const todas = ultima && !arr.find((o) => o.numero === ultima.numero)
      ? [ultima, ...arr]
      : arr;
    this.ordenes.set(todas);
    this.cargando.set(false);
  }
}
