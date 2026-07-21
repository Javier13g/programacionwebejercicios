import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { rolGuard } from './guards/rol.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/empleado/list/list.component').then(m => m.EmpleadoListComponent)
  },
  {
    path: 'empleados/nuevo',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/empleado/form/form.component').then(m => m.EmpleadoFormComponent)
  },
  {
    path: 'empleados/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/empleado/detalle/detalle.component').then(m => m.EmpleadoDetalleComponent)
  },
  {
    path: 'empleados/:id/editar',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/empleado/form/form.component').then(m => m.EmpleadoFormComponent)
  },
  {
    path: 'departamentos',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/departamento/list/list.component').then(m => m.DepartamentoListComponent)
  },
  {
    path: 'departamentos/nuevo',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/departamento/form/form.component').then(m => m.DepartamentoFormComponent)
  },
  {
    path: 'departamentos/:id',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/departamento/detalle/detalle.component').then(m => m.DepartamentoDetalleComponent)
  },
  {
    path: 'departamentos/:id/editar',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/departamento/form/form.component').then(m => m.DepartamentoFormComponent)
  },
  {
    path: 'cargos',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/cargo/list/list.component').then(m => m.CargoListComponent)
  },
  {
    path: 'cargos/nuevo',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/cargo/form/form.component').then(m => m.CargoFormComponent)
  },
  {
    path: 'cargos/:id',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/cargo/detalle/detalle.component').then(m => m.CargoDetalleComponent)
  },
  {
    path: 'cargos/:id/editar',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'rrhh'] },
    loadComponent: () =>
      import('./components/cargo/form/form.component').then(m => m.CargoFormComponent)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/usuario/list/list.component').then(m => m.UsuarioListComponent)
  },
  {
    path: 'usuarios/nuevo',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/usuario/form/form.component').then(m => m.UsuarioFormComponent)
  },
  {
    path: 'usuarios/:id',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/usuario/detalle/detalle.component').then(m => m.UsuarioDetalleComponent)
  },
  {
    path: 'usuarios/:id/editar',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./components/usuario/form/form.component').then(m => m.UsuarioFormComponent)
  },
  { path: '**', redirectTo: '' }
];
