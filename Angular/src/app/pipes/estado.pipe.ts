import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoStock',
  standalone: true,
})
export class EstadoStockPipe implements PipeTransform {
  transform(
    juego: { agotado?: boolean; estado?: string } | null | undefined,
    salida: 'texto' | 'clase' = 'texto',
  ): string {
    if (!juego) return salida === 'clase' ? 'neutro' : 'Sin datos';

    if (juego.agotado) {
      return salida === 'clase' ? 'critico' : 'Agotado';
    }
    const estado = (juego.estado ?? '').toLowerCase();
    if (estado.includes('poca')) {
      return salida === 'clase' ? 'warn' : 'Pocas unidades';
    }
    if (estado.includes('disponible')) {
      return salida === 'clase' ? 'ok' : 'Disponible';
    }
    return salida === 'clase' ? 'neutro' : juego.estado ?? 'Sin datos';
  }
}
