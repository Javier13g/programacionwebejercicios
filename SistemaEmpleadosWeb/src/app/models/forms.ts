export type EstadoEmpleado = 'activo' | 'inactivo';

export const ESTADOS_EMPLEADO: EstadoEmpleado[] = ['activo', 'inactivo'];

export type NivelCargo =
  | 'Directivo'
  | 'Gerencial'
  | 'Profesional'
  | 'Tecnico'
  | 'Operativo'
  | 'Administrativo';

export const NIVELES_CARGO: NivelCargo[] = [
  'Directivo',
  'Gerencial',
  'Profesional',
  'Tecnico',
  'Operativo',
  'Administrativo'
];

export type RolUsuario = 'admin' | 'rrhh' | 'empleado';

export const ROLES_USUARIO: RolUsuario[] = ['admin', 'rrhh', 'empleado'];

export interface EmpleadoRequest {
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaIngreso: string;
  estado: EstadoEmpleado;
  departamentoId: number;
  cargoId: number;
  jefeId?: number;
}

export interface CargoRequest {
  nombre: string;
  nivel: NivelCargo;
  salarioBase: number;
}

export interface DepartamentoRequest {
  nombre: string;
  descripcion?: string;
  jefeId?: number;
}

export interface UsuarioRequest {
  username: string;
  password?: string;
  rol: RolUsuario;
  empleadoId: number;
}
