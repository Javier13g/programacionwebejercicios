import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UtilidadesService {
  private readonly IVA = environment.taxRate;

  formatearMoneda(valor: number | string): string {
    const numero = Number(valor) || 0;
    return `RD$ ${numero.toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  normalizarTexto(texto: string | null | undefined): string {
    if (!texto) return '';
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  capitalizar(texto: string): string {
    return String(texto)
      .split(' ')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  calcularIVA(subtotal: number, tasa?: number): number {
    return Number(subtotal) * (typeof tasa === 'number' ? tasa : this.IVA);
  }

  aleatorio(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generarNumeroOrden(prefijo = 'ORD'): string {
    const numero = this.aleatorio(1, 9999).toString().padStart(4, '0');
    return `${prefijo}-${numero}`;
  }

  guardar(clave: string, valor: unknown): boolean {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      return false;
    }
  }

  leer<T>(clave: string, defecto: T | null = null): T | null {
    try {
      const dato = localStorage.getItem(clave);
      return dato ? (JSON.parse(dato) as T) : defecto;
    } catch (error) {
      console.error('Error al leer de localStorage:', error);
      return defecto;
    }
  }

  eliminar(clave: string): boolean {
    try {
      localStorage.removeItem(clave);
      return true;
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error);
      return false;
    }
  }

  limpiarTodo(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
      return false;
    }
  }

  obtenerFechaHora(): string {
    return new Date().toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
