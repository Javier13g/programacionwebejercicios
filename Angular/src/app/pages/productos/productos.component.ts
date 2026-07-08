import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { Juego, Categoria } from '../../models/producto.model';
import { JuegoCardComponent } from '../../components/juego-card/juego-card.component';
import { UtilidadesService } from '../../services/utilidades.service';
import { CategoryMenuComponent } from '../../components/category-menu/category-menu.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { BusquedaService } from '../../services/busqueda.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JuegoCardComponent,
    CategoryMenuComponent,
    SearchBarComponent,
    CurrencyPipe,
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent implements OnInit, OnDestroy {
  private readonly productosService = inject(ProductosService);
  private readonly route = inject(ActivatedRoute);
  private readonly carritoService = inject(CarritoService);
  private readonly busqueda = inject(BusquedaService);
  readonly utils = inject(UtilidadesService);
  private busquedaSub?: Subscription;

  readonly juegos = signal<Juego[]>([]);
  readonly cargando = signal(true);
  readonly cargandoMas = signal(false);
  readonly error = signal<string | null>(null);
  // Paginación: si hay siguiente página según RAWG
  readonly tieneSiguiente = signal(false);
  readonly paginaActual = signal(1);
  readonly totalApi = signal<number | null>(null);
  // Modo búsqueda server-side activo
  readonly modoBusqueda = signal(false);

  // Filtros (signals para reactividad)
  readonly texto = signal('');
  readonly textoBusqueda = signal('');     // dispara server-side al pulsar Enter / Buscar
  readonly precioMax = signal(100_000);
  readonly categoria = signal('');       // género (slug RAWG)
  readonly soloDisponibles = signal(false);
  readonly orden = signal<'defecto' | 'precio-asc' | 'precio-desc' | 'nombre' | 'rating'>('defecto');

  // Géneros disponibles (slugs RAWG más comunes)
  readonly generos: { slug: string; nombre: string; descripcion?: string }[] = [
    { slug: 'action', nombre: 'Acción', descripcion: 'Aventura, disparos y adrenalina.' },
    { slug: 'rpg', nombre: 'Rol', descripcion: 'Épicas historias y progresión.' },
    { slug: 'adventure', nombre: 'Aventura', descripcion: 'Mundos abiertos y exploración.' },
    { slug: 'strategy', nombre: 'Estrategia', descripcion: 'Planifica y vence.' },
    { slug: 'shooter', nombre: 'Shooter', descripcion: 'Disparos en primera/tercera persona.' },
    { slug: 'indie', nombre: 'Indie', descripcion: 'Estudios independientes.' },
    { slug: 'puzzle', nombre: 'Puzzle', descripcion: 'Acertijos y lógica.' },
    { slug: 'racing', nombre: 'Carreras', descripcion: 'Velocidad y circuitos.' },
    { slug: 'sports', nombre: 'Deportes', descripcion: 'Fútbol, basket, etc.' },
  ];

  /** Lista de categorías para `CategoryMenuComponent`. */
  readonly categorias: Categoria[] = this.generos.map((g) => ({
    id: g.slug,
    nombre: g.nombre,
    descripcion: g.descripcion ?? '',
  }));

  onSeleccionarCategoria(slug: string): void {
    this.categoria.set(slug);
  }

  onBuscarTermino(termino: string): void {
    this.onBuscarTexto(termino);
  }

  readonly filtrados = computed(() => {
    let lista = this.productosService.filtrar(this.juegos(), {
      texto: this.texto(),
      categoria: this.categoria(),
      precioMax: this.precioMax(),
      soloDisponibles: this.soloDisponibles(),
    });

    switch (this.orden()) {
      case 'precio-asc':
        lista = [...lista].sort((a, b) => a.precioConDescuento - b.precioConDescuento);
        break;
      case 'precio-desc':
        lista = [...lista].sort((a, b) => b.precioConDescuento - a.precioConDescuento);
        break;
      case 'nombre':
        lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'rating':
        lista = [...lista].sort((a, b) => b.rating - a.rating);
        break;
    }
    return lista;
  });

  readonly precioMaxFormateado = computed(() =>
    this.utils.formatearMoneda(this.precioMax()),
  );

  /** Estado del catálogo para `*ngSwitch`. */
  readonly estadoCarga = computed<'cargando' | 'error' | 'listo'>(() => {
    if (this.cargando() && this.juegos().length === 0) return 'cargando';
    if (this.error()) return 'error';
    return 'listo';
  });

  // Recargar cuando cambia el género (búsqueda server-side)
  constructor() {
    // Si cambia la categoría, recargar desde cero
    effect(() => {
      const gen = this.categoria();
      // No recargar en la primera ejecución (ngOnInit ya carga)
      if (this.juegos().length === 0 && !gen) return;
      this.cargar();
    });
  }

  ngOnInit(): void {
    // Hidratar el input con el término previo (si el header ya buscó algo)
    const inicial = this.busqueda.termino;
    if (inicial) {
      this.texto.set(inicial);
      this.textoBusqueda.set(inicial);
    }
    this.cargar();

    // Reaccionar a `?q=` en la URL: cuando se navega desde el header
    // con `routerLink="/productos?q=..."`, sincronizamos y recargamos.
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      const limpio = q.trim();
      const actual = this.textoBusqueda().trim();
      if (limpio !== actual) {
        this.texto.set(limpio);
        this.textoBusqueda.set(limpio);
        this.busqueda.establecer(limpio);
        this.cargar();
      }
    });

    // También escuchar al BusquedaService por si cambia el término
    // sin haber navegación (p.ej. otro componente lo actualiza).
    this.busquedaSub = this.busqueda.cambios$.subscribe((termino) => {
      const limpio = (termino ?? '').trim();
      if (limpio !== this.textoBusqueda().trim()) {
        this.texto.set(limpio);
        this.textoBusqueda.set(limpio);
        this.cargar();
      }
    });
  }

  ngOnDestroy(): void {
    this.busquedaSub?.unsubscribe();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.paginaActual.set(1);
    this.juegos.set([]);
    this.totalApi.set(null);

    const filtros = this.construirFiltrosServer();

    // Decidir: ¿búsqueda server-side por nombre o listado normal?
    const busqueda = this.textoBusqueda().trim();
    const peticion = busqueda
      ? this.productosService.buscarPorNombre(busqueda)
      : this.productosService.cargarCatalogo(filtros);

    peticion.subscribe({
      next: (resp) => {
        this.aplicarRespuesta(resp, /*resetear*/ true);
        this.modoBusqueda.set(!!busqueda);
      },
      error: (err) => {
        console.error('Error al cargar juegos:', err);
        this.error.set(err?.message ?? 'Error desconocido');
        this.cargando.set(false);
      },
      complete: () => {
        this.cargando.set(false);
      },
    });
  }

  /**
   * Carga la siguiente página y concatena los resultados.
   * Si está en modo búsqueda, hace otra búsqueda paginada.
   */
  cargarMas(): void {
    if (!this.tieneSiguiente() || this.cargandoMas()) return;

    this.cargandoMas.set(true);
    this.error.set(null);

    const siguiente = this.paginaActual() + 1;
    const filtros = this.construirFiltrosServer();
    const busqueda = this.textoBusqueda().trim();

    const peticion = busqueda
      ? this.productosService.listar({ search: busqueda, page: siguiente, pageSize: 40 })
      : this.productosService.cargarPagina(siguiente, filtros);

    peticion.subscribe({
      next: (resp) => this.aplicarRespuesta(resp, /*resetear*/ false),
      error: (err) => {
        console.error('Error al cargar más juegos:', err);
        this.error.set(err?.message ?? 'Error desconocido');
        this.cargandoMas.set(false);
      },
      complete: () => {
        this.cargandoMas.set(false);
      },
    });
  }

  /**
   * Maneja el evento `buscar` emitido por el `SearchBarComponent`.
   *
   * La búsqueda SOLO se dispara cuando el usuario pulsa Enter o
   * hace clic en el botón "Buscar" (submit del formulario del
   * search-bar). Aquí ya recibimos el término final, sin
   * debounce adicional.
   */
  onBuscarTexto(valor: string): void {
    const nuevo = (valor ?? '').trim();
    this.texto.set(nuevo);
    if (nuevo !== this.textoBusqueda().trim()) {
      this.textoBusqueda.set(nuevo);
      this.cargar();
    }
  }

  /**
   * Construye los filtros server-side en base a la categoría seleccionada.
   */
  private construirFiltrosServer(): { ordering: string; genres?: string } {
    const filtros: { ordering: string; genres?: string } = {
      ordering: '-rating',
    };
    if (this.categoria()) {
      filtros.genres = this.categoria();
    }
    return filtros;
  }

  /**
   * Procesa la respuesta de RAWG: actualiza juegos, página y si hay siguiente.
   */
  private aplicarRespuesta(
    resp: { count: number; next: string | null; results: Juego[] },
    resetear: boolean,
  ): void {
    this.totalApi.set(resp.count);
    this.tieneSiguiente.set(!!resp.next);

    if (resetear) {
      this.juegos.set([...resp.results]);
      this.paginaActual.set(1);
    } else {
      // Dedup por id al concatenar páginas
      const mapa = new Map<number, Juego>();
      this.juegos().forEach((j) => mapa.set(j.id, j));
      resp.results.forEach((j) => mapa.set(j.id, j));
      this.juegos.set(Array.from(mapa.values()));
      this.paginaActual.update((p) => p + 1);
    }
  }

  limpiar(): void {
    this.texto.set('');
    this.textoBusqueda.set('');
    this.precioMax.set(100_000);
    this.categoria.set('');
    this.soloDisponibles.set(false);
    this.orden.set('defecto');
    this.modoBusqueda.set(false);
    this.cargar();
  }

  /** Manejador del evento (agregado) emitido por `JuegoCardComponent`. */
  alAgregar(juego: Juego): void {
    this.carritoService.agregar(juego, 1);
  }
}
