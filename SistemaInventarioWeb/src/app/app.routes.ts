import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/productos/productos-list.component').then(m => m.ProductosListComponent)
  },
  {
    path: 'productos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/productos/producto-detalle.component').then(m => m.ProductoDetalleComponent)
  },
  {
    path: 'productos/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/productos/producto-form.component').then(m => m.ProductoFormComponent)
  },
  { path: '**', redirectTo: 'productos' }
];
