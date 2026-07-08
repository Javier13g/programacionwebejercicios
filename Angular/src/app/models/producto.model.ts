// Modelo de Juego para GameStore Online (API RAWG)
// Documentación: https://api.rawg.io/docs/

export interface RawgPlatform {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  genres: RawgGenre[];
  platforms: { platform: RawgPlatform }[];
  description_raw?: string;
}

export interface Juego {
  id: number;
  nombre: string;
  slug: string;
  categoria: string;
  plataformas: string;
  precio: number;
  precioConDescuento: number;
  tieneOferta: boolean;
  oferta: number;
  imagen: string;
  descripcion: string;
  descripcionOriginal: string | null;
  rating: number;
  metacritic: number | null;
  released: string;
  agotado: boolean;
  estado: string;
  especificaciones: { caracteristica: string; valor: string }[];
}

export interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export interface ResumenCarrito {
  cantidad: number;
  subtotal: number;
  impuestos: number;
  total: number;
  vacio: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}
