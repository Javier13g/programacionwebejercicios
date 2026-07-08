import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Servicio de traducción EN → ES.
 *
 * Estrategia:
 *  - Términos cortos y repetitivos (géneros, plataformas) se traducen
 *    con mapas estáticos locales (sin coste).
 *  - Texto libre (descripciones) se traduce con MiniMax y se cachea
 *    en sessionStorage para evitar llamadas repetidas.
 *  - Si la API falla o no hay key configurada, devuelve el original
 *    (degradación elegante).
 */
@Injectable({ providedIn: 'root' })
export class TraduccionService {
  private readonly http = inject(HttpClient);

  private readonly cfg = environment.traduccion;

  readonly traduciendo = signal(false);

  private readonly cache = new Map<string, string>();

  private readonly generosEs: Record<string, string> = {
    Action: 'Acción',
    Adventure: 'Aventura',
    RPG: 'Rol',
    Strategy: 'Estrategia',
    Shooter: 'Disparos',
    Puzzle: 'Puzle',
    Racing: 'Carreras',
    Sports: 'Deportes',
    Indie: 'Indie',
    Simulation: 'Simulación',
    Arcade: 'Arcade',
    Fighting: 'Lucha',
    Platformer: 'Plataformas',
    Family: 'Familia',
    Board: 'Tablero',
    Educational: 'Educativo',
    Card: 'Cartas',
    'Massively Multiplayer': 'Multijugador Masivo',
    'Role-playing': 'Rol',
    'Real Time Strategy': 'Estrategia en Tiempo Real',
    'Tactical': 'Táctico',
    'Turn-based strategy': 'Estrategia por Turnos',
    'Quiz/Trivia': 'Quiz/Trivia',
    'Hack and slash/Beat em up': 'Hack and slash',
    'Pinball': 'Pinball',
  };

  private readonly plataformasEs: Record<string, string> = {
    PC: 'PC',
    'Xbox One': 'Xbox One',
    'Xbox 360': 'Xbox 360',
    'Xbox Series S/X': 'Xbox Series S/X',
    PlayStation: 'PlayStation',
    'PlayStation 2': 'PlayStation 2',
    'PlayStation 3': 'PlayStation 3',
    'PlayStation 4': 'PlayStation 4',
    'PlayStation 5': 'PlayStation 5',
    'PS Vita': 'PS Vita',
    PSP: 'PSP',
    'Nintendo Switch': 'Nintendo Switch',
    Wii: 'Wii',
    'Wii U': 'Wii U',
    'Nintendo DS': 'Nintendo DS',
    'Nintendo 3DS': 'Nintendo 3DS',
    'Game Boy': 'Game Boy',
    'Game Boy Advance': 'Game Boy Advance',
    'Game Boy Color': 'Game Boy Color',
    'Nintendo 64': 'Nintendo 64',
    'Nintendo DSi': 'Nintendo DSi',
    macOS: 'macOS',
    Linux: 'Linux',
    Android: 'Android',
    iOS: 'iOS',
    'Apple II': 'Apple II',
    Atari: 'Atari',
    'Commodore / Amiga': 'Commodore / Amiga',
    'SEGA Master System': 'SEGA Master System',
    'SEGA Mega Drive/Genesis': 'SEGA Mega Drive/Genesis',
    'SEGA Saturn': 'SEGA Saturn',
    'SEGA CD': 'SEGA CD',
    'SEGA 32X': 'SEGA 32X',
    'SEGA Game Gear': 'SEGA Game Gear',
    'Dreamcast': 'Dreamcast',
    '3DO': '3DO',
    'Jaguar': 'Jaguar',
    'Game Cube': 'GameCube',
    'Neo Geo': 'Neo Geo',
    Web: 'Web',
  };

  traducirGenero(ingles: string): string {
    if (!ingles) return '';
    return this.generosEs[ingles] ?? ingles;
  }

  traducirPlataforma(ingles: string): string {
    if (!ingles) return '';
    return this.plataformasEs[ingles] ?? ingles;
  }


  traducirPlataformas(cadena: string): string {
    if (!cadena) return '';
    return cadena
      .split(',')
      .map((p) => this.traducirPlataforma(p.trim()))
      .filter(Boolean)
      .join(', ');
  }

  /**
   * Traduce texto libre (descripción) usando MiniMax.
   * Devuelve el original si la API falla, está deshabilitada, o se agota el timeout.
   *
   * Usa caché en memoria + sessionStorage. Las claves se hashean con el texto
   * (truncado a 240 chars que es lo que pasamos a la API) para evitar colisiones.
   */
  traducirDescripcion(texto: string): Observable<string> {
    const trimmed = (texto ?? '').trim();
    if (!trimmed) return of('');

    const cacheKey = this.hashKey(trimmed);
    const cached = this.cache.get(cacheKey);
    if (cached) return of(cached);

    try {
      const stored = sessionStorage.getItem(`trad3:${cacheKey}`);
      if (stored) {
        this.cache.set(cacheKey, stored);
        return of(stored);
      }
    } catch {
    }

    if (!this.cfg.apiKey || this.cfg.apiKey === 'TU_API_KEY_AQUI') {
      return of(trimmed);
    }

    this.traduciendo.set(true);
    const url = `${this.cfg.baseUrl}/chat/completions`;
    console.log('[TraduccionService] Llamando a MiniMax...', { url, modelo: this.cfg.modelo, chars: trimmed.length });
    const body = {
      model: this.cfg.modelo,
      temperature: 0.1,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content:
            'Eres un traductor universal. Tu trabajo: recibir texto en CUALQUIER ' +
            'idioma (inglés, francés, alemán, portugués, japonés, etc.) y devolverlo ' +
            'SIEMPRE en español neutro. Reglas estrictas:\n' +
            '(1) Responde SOLO con la traducción final en español, nada más.\n' +
            '(2) NO incluyas razonamiento, notas, ni bloques de pensamiento.\n' +
            '(3) NO uses comillas, ni "Aquí está la traducción:", ni prefijos.\n' +
            '(4) Conserva nombres propios (juegos, personajes, marcas, empresas).\n' +
            '(5) Si el texto YA está en español, devuélvelo limpio y mejorado en español.\n' +
            '(6) Español neutro y conciso.',
        },
        {
          role: 'user',
          content: `Traduce al español (sin importar el idioma original):\n${trimmed}`,
        },
      ],
    };

    return this.http
      .post<{
        choices?: { message?: { content?: string } }[];
      }>(url, body, {
        headers: {
          Authorization: `Bearer ${this.cfg.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        timeout(this.cfg.timeoutMs),
        map((resp) => {
          const crudo = resp.choices?.[0]?.message?.content ?? '';
          console.log('[TraduccionService] Respuesta recibida', { length: crudo.length, preview: crudo.slice(0, 80) });

          const THINK_RE = new RegExp(
            String.raw`^\s*(?:think|reasoning|reflection)[\s\S]*?(?:(?:\/think|\/reasoning|\/reflection)|$)`,
            'i',
          );
          let limpio = crudo.replace(THINK_RE, '').trim();

          // Si por alguna razón no se eliminó del inicio, buscar la última ocurrencia
          // del cierre y cortar todo lo anterior.
          const lastClose = limpio.search(/\/think|\/reasoning|\/reflection/i);
          if (lastClose > 0) {
            limpio = limpio.slice(lastClose + 7).trim();
          }

          // Eliminar prefijos tipo "Traducción:" "Aquí está:" etc.
          limpio = limpio.replace(
            /^\s*(traducci[oó]n|aqu[ií] est[aá]|response|output|answer)\s*[:：\-]\s*/i,
            '',
          );
          // Eliminar comillas envolventes
          limpio = limpio.replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, '').trim();

          // Validar idioma: si >25% palabras son inglés común → fallback
          const palabrasIngles = this.contarPalabrasIngles(limpio);
          const totalPalabras = this.contarPalabras(limpio);
          const ratioIngles = totalPalabras > 0 ? palabrasIngles / totalPalabras : 0;

          console.log('[TraduccionService] Análisis de idioma', {
            totalPalabras, palabrasIngles, ratioIngles: ratioIngles.toFixed(2),
          });

          const pareceIngles = ratioIngles > 0.25 && totalPalabras > 10;
          const esValido =
            limpio.length > 0 &&
            !pareceIngles &&
            limpio.toLowerCase() !== trimmed.toLowerCase();
          const final = esValido ? limpio : trimmed;

          console.log('[TraduccionService] Resultado', {
            esValido, pareceIngles, lengthFinal: final.length, previewFinal: final.slice(0, 80),
          });

          // Persistir en caché (versión 3: con detección de idioma)
          // Persistir en caché
          this.cache.set(cacheKey, final);
          try {
            sessionStorage.setItem(`trad3:${cacheKey}`, final);
          } catch {
            /* ignorar */
          }
          return final;
        }),
        catchError((err) => {
          // Loguear para diagnóstico (visible en DevTools)
          console.warn('[TraduccionService] No se pudo traducir, usando original:', {
            status: err?.status,
            statusText: err?.statusText,
            message: err?.message,
            url,
            modelo: this.cfg.modelo,
          });
          return of(trimmed);
        }), // fallback elegante
        map((t) => {
          this.traduciendo.set(false);
          return t;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
  }

  private hashKey(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    }
    return `d${h.toString(36)}`;
  }

  private readonly palabrasInglesComunes = new Set([
    'the', 'and', 'is', 'in', 'of', 'to', 'a', 'an', 'for', 'on', 'with',
    'as', 'by', 'at', 'from', 'this', 'that', 'it', 'be', 'are', 'was',
    'were', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'should',
    'may', 'might', 'must', 'do', 'does', 'did', 'not', 'no', 'but', 'or',
    'if', 'then', 'than', 'so', 'such', 'its', 'their', 'there', 'these',
    'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'any',
    'one', 'two', 'first', 'last', 'also', 'very', 'too', 'only', 'just',
    'about', 'after', 'before', 'because', 'while', 'during', 'through',
    'between', 'game', 'player', 'players', 'world', 'level', 'character',
    'story', 'new', 'old', 'play', 'plays', 'release', 'released',
    'features', 'feature', 'including', 'includes', 'offers', 'allowing',
  ]);

  private contarPalabras(texto: string): number {
    if (!texto) return 0;
    const matches = texto.toLowerCase().match(/\b[a-záéíóúñü]{3,}\b/g);
    return matches ? matches.length : 0;
  }


  private contarPalabrasIngles(texto: string): number {
    if (!texto) return 0;
    const matches = texto.toLowerCase().match(/\b[a-záéíóúñü]{3,}\b/g);
    if (!matches) return 0;
    let count = 0;
    for (const w of matches) {
      if (this.palabrasInglesComunes.has(w)) count++;
    }
    return count;
  }
}
