import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { UtilidadesService } from './utilidades.service';

@Injectable({ providedIn: 'root' })
export class BusquedaService {
  private readonly utils = inject(UtilidadesService);
  private static readonly CLAVE = 'gamestore_busqueda';

  private readonly termino$ = new BehaviorSubject<string>(
    this.utils.leer<string>(BusquedaService.CLAVE, '') ?? '',
  );

  readonly cambios$: Observable<string> = this.termino$
    .asObservable()
    .pipe(distinctUntilChanged());

  get termino(): string {
    return this.termino$.value;
  }

  establecer(termino: string): void {
    const limpio = (termino ?? '').trim();
    if (limpio === this.termino$.value) return;
    this.termino$.next(limpio);
    this.utils.guardar(BusquedaService.CLAVE, limpio);
  }

  /** Limpia el término. */
  limpiar(): void {
    this.establecer('');
  }
}
