import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarritoService } from '../../services/carrito.service';
import { TemaService } from '../../services/tema.service';
import { UtilidadesService } from '../../services/utilidades.service';
import { AuthService } from '../../services/auth.service';
import { BusquedaService } from '../../services/busqueda.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly carrito = inject(CarritoService);
  readonly tema = inject(TemaService);
  readonly utils = inject(UtilidadesService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly busqueda = inject(BusquedaService);

  readonly reloj = signal('');
  private relojId?: ReturnType<typeof setInterval>;
  private carritoSub?: Subscription;

  readonly cantidadCarrito = signal(this.carrito.cantidad());

  ngOnInit(): void {
    this.reloj.set(this.utils.obtenerFechaHora());
    this.relojId = setInterval(() => {
      this.reloj.set(this.utils.obtenerFechaHora());
    }, 1000);

    this.carritoSub = this.carrito.cambios$.subscribe((items) => {
      this.cantidadCarrito.set(
        items.reduce((s, i) => s + i.cantidad, 0),
      );
    });
  }

  ngOnDestroy(): void {
    if (this.relojId) clearInterval(this.relojId);
    this.carritoSub?.unsubscribe();
  }

  alternarTema(): void {
    this.tema.alternar();
  }

  cerrarSesion(): void {
    this.auth.logout$().subscribe();
  }

  alBuscar(termino: string): void {
    const t = (termino ?? '').trim();
    if (t) {
      this.router.navigate(['/productos'], { queryParams: { q: t } });
    } else {
      this.router.navigate(['/productos']);
    }
  }
}
