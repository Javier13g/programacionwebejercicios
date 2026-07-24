import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbPaginationModule, DecimalPipe, SidebarComponent],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.scss']
})
export class ProductosListComponent implements OnInit {
  private readonly productosService = inject(ProductosService);

  readonly productos = signal<Producto[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(5);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productosService
      .listar(
        this.searchTerm() || undefined,
        undefined,
        undefined,
        undefined,
        this.currentPage() - 1,
        this.pageSize()
      )
      .subscribe({
        next: (page) => {
          this.productos.set(page.content ?? []);
          this.totalElements.set(page.totalElements ?? 0);
          this.totalPages.set(page.totalPages ?? 0);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.statusText || 'Error al cargar productos'
          );
        }
      });
  }

  buscar(): void {
    this.currentPage.set(1);
    this.cargar();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.cargar();
  }

  trackById(_: number, item: Producto): number {
    return item.id ?? -1;
  }

  stockBajo(p: Producto): boolean {
    const min = p.stockMinimo ?? 0;
    return (p.stockActual ?? 0) <= min;
  }
}
