 import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'descuento',
  standalone: true,
})
export class DescuentoPipe implements PipeTransform {
  transform(
    valor: number | string | null | undefined,
    porcentaje: number = 0,
    modo: 'precio' | 'ahorro' | 'texto' = 'precio',
    prefijo: string = 'RD$',
  ): string {
    const numero = Number(valor);
    if (Number.isNaN(numero)) {
      return `${prefijo} 0.00`;
    }

    const pct = Math.max(0, Math.min(100, Number(porcentaje) || 0));
    const factor = 1 - pct / 100;
    const precioFinal = numero * factor;
    const ahorro = numero - precioFinal;

    const formatear = (n: number) =>
      `${prefijo} ${n.toLocaleString('es-DO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    switch (modo) {
      case 'ahorro':
        return formatear(ahorro);
      case 'texto':
        return `${formatear(precioFinal)} (${pct}% OFF)`;
      case 'precio':
      default:
        return formatear(precioFinal);
    }
  }
}
