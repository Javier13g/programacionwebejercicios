import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Movimiento, TipoMovimiento } from '../../models/movimiento.model';

@Component({
  selector: 'app-movimiento-detalle',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './movimiento-detalle.component.html'
})
export class MovimientoDetalleComponent {
  readonly activeModal = inject(NgbActiveModal);

  @Input() movimiento: Movimiento | null = null;

  tipoLabel(t: TipoMovimiento | undefined): string {
    switch (t) {
      case 'ENTRADA': return 'Entrada';
      case 'SALIDA':  return 'Salida';
      case 'AJUSTE':  return 'Ajuste';
      default: return t ?? '—';
    }
  }

  tipoBadge(t: TipoMovimiento | undefined): string {
    switch (t) {
      case 'ENTRADA': return 'bg-success';
      case 'SALIDA':  return 'bg-danger';
      case 'AJUSTE':  return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  cantidadDisplay(): { texto: string; clase: string } {
    const m = this.movimiento;
    if (!m) return { texto: '—', clase: 'text-muted' };
    const c = m.cantidad ?? 0;
    if (m.tipo === 'ENTRADA') return { texto: `+${c}`, clase: 'text-success' };
    if (m.tipo === 'SALIDA')  return { texto: `-${c}`, clase: 'text-danger' };
    return { texto: `${c}`, clase: 'text-muted' };
  }

  stockActualProducto(): number | null {
    return this.movimiento?.producto?.stockActual ?? null;
  }
}
