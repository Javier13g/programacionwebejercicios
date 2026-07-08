import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  UpperCasePipe,
} from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { Juego, Categoria } from '../../models/producto.model';
import { JuegoCardComponent } from '../../components/juego-card/juego-card.component';
import { CategoryMenuComponent } from '../../components/category-menu/category-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JuegoCardComponent,
    CategoryMenuComponent,
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly productosService = inject(ProductosService);
  private readonly carritoService = inject(CarritoService);

  readonly juegos = signal<Juego[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  // Mensajes rotativos del banner (orientados a videojuegos)
  readonly mensajesBanner = [
    '🎮 Lanzamientos destacados de la semana disponibles ya',
    '🚚 Envío gratis en compras mayores a RD$ 25,000',
    '💳 12 cuotas sin intereses con tarjetas seleccionadas',
    '🔥 Hasta 35% OFF en títulos seleccionados cada viernes',
  ];
  readonly bannerMsg = signal(this.mensajesBanner[0]);
  private bannerIdx = 0;
  private bannerId?: ReturnType<typeof setTimeout>;

  // Oferta timer (10 min)
  readonly restante = signal(600);
  private ofertaId?: ReturnType<typeof setInterval>;
  readonly ofertaTexto = computed(() => {
    const r = this.restante();
    if (r <= 0) return '¡Oferta finalizada!';
    const m = String(Math.floor(r / 60)).padStart(2, '0');
    const s = String(r % 60).padStart(2, '0');
    return `⏰ Oferta termina en ${m}:${s}`;
  });

  // Modal promocional
  readonly modalAbierto = signal(false);

  /** Estado de carga combinado para usar con `*ngSwitch` en el template. */
  readonly estadoCarga = computed<
    'cargando' | 'error' | 'listo'
  >(() => {
    if (this.cargando()) return 'cargando';
    if (this.error()) return 'error';
    return 'listo';
  });
  private modalId?: ReturnType<typeof setTimeout>;

  // Géneros destacados (slugs RAWG)
  readonly categorias: Categoria[] = [
    {
      id: 'action',
      nombre: 'Acción',
      descripcion: 'Aventura, disparos y adrenalina pura en cada partida.',
    },
    {
      id: 'rpg',
      nombre: 'Rol',
      descripcion: 'Vive épicas historias y mejora a tus personajes.',
    },
    {
      id: 'adventure',
      nombre: 'Aventura',
      descripcion: 'Explora mundos abiertos y resuelve misterios.',
    },
    {
      id: 'strategy',
      nombre: 'Estrategia',
      descripcion: 'Planifica, construye y vence a tus rivales.',
    },
    {
      id: 'indie',
      nombre: 'Indie',
      descripcion: 'Títulos únicos creados por estudios independientes.',
    },
  ];

  // Icono representativo por género (estilo gamer)
  iconoCategoria(id: string): string {
    const iconos: Record<string, string> = {
      action: '⚔',
      rpg: '🛡',
      adventure: '🗺',
      strategy: '♟',
      indie: '✦',
    };
    return iconos[id] ?? '◆';
  }

  // Juegos destacados (los 8 primeros)
  readonly destacados = computed(() => this.juegos().slice(0, 8));
  readonly juegoBanner = computed(() => this.juegos()[0] ?? null);

  ngOnInit(): void {
    this.cargar();
    this.iniciarBanner();
    this.iniciarOfertaTimer();
    this.programarModal();
  }

  ngOnDestroy(): void {
    if (this.bannerId) clearTimeout(this.bannerId);
    if (this.ofertaId) clearInterval(this.ofertaId);
    if (this.modalId) clearTimeout(this.modalId);
  }

  cargar(): void {
    this.productosService.cargarDestacados(12).subscribe({
      next: (data) => {
        this.juegos.set(data);
        this.cargando.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error('Error al cargar juegos:', err);
        this.error.set(err?.message ?? 'Error desconocido');
        this.cargando.set(false);
      },
    });
  }

  private iniciarBanner(): void {
    const rotar = () => {
      this.bannerIdx = (this.bannerIdx + 1) % this.mensajesBanner.length;
      this.bannerMsg.set(this.mensajesBanner[this.bannerIdx]);
      this.bannerId = setTimeout(rotar, 4000);
    };
    this.bannerId = setTimeout(rotar, 4000);
  }

  private iniciarOfertaTimer(): void {
    this.ofertaId = setInterval(() => {
      this.restante.update((r) => (r <= 0 ? 0 : r - 1));
      if (this.restante() <= 0 && this.ofertaId) {
        clearInterval(this.ofertaId);
      }
    }, 1000);
  }

  private programarModal(): void {
    this.modalId = setTimeout(() => {
      this.modalAbierto.set(true);
    }, 2000);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  alAgregar(juego: Juego): void {
    this.carritoService.agregar(juego);
  }
}
