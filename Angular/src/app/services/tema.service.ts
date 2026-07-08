import { Injectable, inject, signal, effect } from '@angular/core';
import { UtilidadesService } from './utilidades.service';

const CLAVE_TEMA = 'gamestore_tema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly utils = inject(UtilidadesService);
  private readonly _tema = signal<'claro' | 'oscuro'>(
    (this.utils.leer<'claro' | 'oscuro'>(CLAVE_TEMA, 'claro') as 'claro' | 'oscuro') ?? 'claro'
  );

  readonly tema = this._tema.asReadonly();

  constructor() {
    effect(() => {
      const t = this._tema();
      document.documentElement.setAttribute('data-tema', t);
      this.utils.guardar(CLAVE_TEMA, t);
    });
  }

  alternar(): void {
    this._tema.update((t) => (t === 'oscuro' ? 'claro' : 'oscuro'));
  }
}
