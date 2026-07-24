export interface Producto {
  id?: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stockActual?: number;
  stockMinimo?: number;
  categoriaId?: number;
  categoria?: Categoria;
  proveedorId?: number;
  proveedor?: Proveedor;
  imageUrl?: string;
  imageDeleteHash?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  username?: string;
  nombre?: string;
  rol?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
