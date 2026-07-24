import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MovimientosService } from '../../services/movimientos.service';
import { ProductosService } from '../../services/productos.service';
import { Movimiento, MovimientoFiltros, TipoMovimiento } from '../../models/movimiento.model';
import { Producto } from '../../models/producto.model';
import { MovimientoFormComponent } from './movimiento-form.component';
import { MovimientoDetalleComponent } from './movimiento-detalle.component';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    NgbModalModule,
    SidebarComponent
  ],
  templateUrl: './movimientos-list.component.html',
  styleUrls: ['./movimientos-list.component.scss']
})
export class MovimientosListComponent implements OnInit {
  private readonly movimientosService = inject(MovimientosService);
  private readonly productosService = inject(ProductosService);
  private readonly modalService = inject(NgbModal);

  readonly movimientos = signal<Movimiento[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly productoIdFiltro = signal<number | null>(null);
  readonly tipoFiltro = signal<TipoMovimiento | ''>('');
  readonly desde = signal('');
  readonly hasta = signal('');

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly productos = signal<Producto[]>([]);
  readonly tipos: { value: TipoMovimiento; label: string; badge: string }[] = [
    { value: 'ENTRADA', label: 'Entrada', badge: 'bg-success' },
    { value: 'SALIDA', label: 'Salida', badge: 'bg-danger' },
    { value: 'AJUSTE', label: 'Ajuste', badge: 'bg-secondary' }
  ];

  readonly hayFiltros = computed(() =>
    !!this.searchTerm() ||
    this.productoIdFiltro() != null ||
    !!this.tipoFiltro() ||
    !!this.desde() ||
    !!this.hasta()
  );

  ngOnInit(): void {
    this.cargarProductosFiltro();
    this.cargar();
  }

  private cargarProductosFiltro(): void {
    this.productosService
      .listar(undefined, undefined, undefined, undefined, 0, 1000)
      .subscribe({
        next: (page) => this.productos.set(page.content ?? []),
        error: () => this.productos.set([])
      });
  }

  cargar(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const filtros: MovimientoFiltros = {
      page: this.currentPage() - 1,
      size: this.pageSize()
    };
    if (this.searchTerm()) filtros.q = this.searchTerm();
    if (this.productoIdFiltro() != null) filtros.productoId = this.productoIdFiltro()!;
    if (this.tipoFiltro()) filtros.tipo = this.tipoFiltro() as TipoMovimiento;
    if (this.desde()) filtros.desde = this.desde();
    if (this.hasta()) filtros.hasta = this.hasta();

    this.movimientosService.listar(filtros).subscribe({
      next: (page) => {
        this.movimientos.set(page.content ?? []);
        this.totalElements.set(page.totalElements ?? 0);
        this.totalPages.set(page.totalPages ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.statusText || 'Error al cargar movimientos'
        );
      }
    });
  }

  buscar(): void {
    this.currentPage.set(1);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.productoIdFiltro.set(null);
    this.tipoFiltro.set('');
    this.desde.set('');
    this.hasta.set('');
    this.currentPage.set(1);
    this.cargar();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.cargar();
  }

  abrirModalNuevo(): void {
    const modalRef = this.modalService.open(MovimientoFormComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.result
      .then((creado: boolean) => {
        if (creado) {
          this.currentPage.set(1);
          this.cargar();
        }
      })
      .catch(() => {
      });
  }

  abrirDetalle(m: Movimiento): void {
    const modalRef = this.modalService.open(MovimientoDetalleComponent, {
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.movimiento = m;
  }

  trackById(_: number, item: Movimiento): number {
    return item.id ?? -1;
  }

  tipoLabel(t: TipoMovimiento): string {
    return this.tipos.find((x) => x.value === t)?.label ?? t;
  }

  tipoBadge(t: TipoMovimiento): string {
    return this.tipos.find((x) => x.value === t)?.badge ?? 'bg-secondary';
  }

  cantidadSigno(m: Movimiento): string {
    if (m.tipo === 'SALIDA') return `-${m.cantidad}`;
    if (m.tipo === 'ENTRADA') return `+${m.cantidad}`;
    return `${m.cantidad}`;
  }

  cantidadClass(m: Movimiento): string {
    if (m.tipo === 'ENTRADA') return 'text-success fw-semibold';
    if (m.tipo === 'SALIDA') return 'text-danger fw-semibold';
    return 'text-muted';
  }
}
