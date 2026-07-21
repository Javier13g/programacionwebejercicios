export interface Cargo {
  id: number;
  nombre: string;
  nivel: string;
  salarioBase: number;
}

export interface Departamento {
  id: number;
  nombre: string;
  descripcion?: string;
  jefe?: Empleado | null;
}

export interface Empleado {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaIngreso: string;
  estado: string;
  departamentoId?: number;
  departamento?: Departamento | null;
  cargoId?: number;
  cargo?: Cargo | null;
  jefeId?: number | null;
  jefe?: Empleado | null;
}

export interface Usuario {
  id: number;
  username: string;
  rol: string;
  deleted?: boolean;
  deletedAt?: string | null;
  empleado?: Empleado | null;
  empleadoId?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
