import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'GameStore Online - Inicio',
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./pages/productos/productos.component').then(
        (m) => m.ProductosComponent,
      ),
    title: 'GameStore - Catálogo',
  },
  {
    path: 'juego/:id',
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle.component').then(
        (m) => m.ProductoDetalleComponent,
      ),
    title: 'GameStore - Detalle',
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle.component').then(
        (m) => m.ProductoDetalleComponent,
      ),
    title: 'GameStore - Detalle',
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito/carrito.component').then((m) => m.CarritoComponent),
    title: 'GameStore - Carrito',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
    title: 'GameStore - Checkout',
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/contacto/contacto.component').then(
        (m) => m.ContactoComponent,
      ),
    title: 'GameStore - Contacto',
  },
  {
    path: 'acerca',
    loadComponent: () =>
      import('./pages/acerca/acerca.component').then((m) => m.AcercaComponent),
    title: 'GameStore - Acerca de',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'GameStore - Iniciar sesión',
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
    title: 'GameStore - Mi perfil',
  },
  {
    path: 'historial',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historial/historial.component').then(
        (m) => m.HistorialComponent,
      ),
    title: 'GameStore - Historial',
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    title: 'GameStore - Administración',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: '404 - Página no encontrada',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: '404 - Página no encontrada',
  },
];
