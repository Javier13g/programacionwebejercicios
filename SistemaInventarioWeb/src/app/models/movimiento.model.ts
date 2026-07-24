import { Producto, Usuario } from './producto.model';

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface Movimiento {
  id?: number;
  fecha?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  observacion?: string;
  producto?: Producto;
  usuario?: Usuario;
}

export interface MovimientoRequest {
  productoId: number;
  usuarioId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  observacion?: string;
}

export interface MovimientoFiltros {
  q?: string;
  productoId?: number;
  tipo?: TipoMovimiento;
  desde?: string;
  hasta?: string;
  page?: number;
  size?: number;
}
