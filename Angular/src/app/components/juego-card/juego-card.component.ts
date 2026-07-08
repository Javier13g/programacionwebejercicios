import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Juego } from '../../models/producto.model';
import { UtilidadesService } from '../../services/utilidades.service';

@Component({
  selector: 'app-juego-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './juego-card.component.html',
  styleUrl: './juego-card.component.css',
})
export class JuegoCardComponent {
  @Input({ required: true }) juego!: Juego;

  @Output() agregado = new EventEmitter<Juego>();
  @Output() seleccionado = new EventEmitter<Juego>();

  readonly utils = inject(UtilidadesService);

  agregar(): void {
    if (this.juego && !this.juego.agotado) {
      this.agregado.emit(this.juego);
    }
  }

  seleccionar(): void {
    if (this.juego) {
      this.seleccionado.emit(this.juego);
    }
  }

  estrellas(): string {
    const r = Math.round(this.juego?.rating ?? 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }
}
