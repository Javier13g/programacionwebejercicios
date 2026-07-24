import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, SidebarComponent],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.scss']
})
export class ProductoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productosService = inject(ProductosService);

  readonly producto = signal<Producto | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.errorMessage.set('ID de producto inválido');
      this.loading.set(false);
      return;
    }
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productosService.obtenerPorId(id).subscribe({
      next: (p) => {
        this.producto.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.statusText || 'No se pudo cargar el producto'
        );
      }
    });
  }

  volver(): void {
    this.router.navigate(['/productos']);
  }

  editar(): void {
    const id = this.producto()?.id;
    if (id != null) {
      this.router.navigate(['/productos', id, 'editar']);
    }
  }
}
