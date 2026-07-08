import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusquedaService } from '../../services/busqueda.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent implements OnInit {
  @Input() placeholder = 'Buscar juegos...';
  @Input() autofocus = false;
  @Input() valorInicial = '';

  @Output() buscar = new EventEmitter<string>();
  @Output() enviar = new EventEmitter<string>();
  @Output() limpiar = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly busqueda = inject(BusquedaService);

  readonly termino = signal('');

  ngOnInit(): void {
    if (this.valorInicial) this.termino.set(this.valorInicial);
  }

  onInput(valor: string): void {
    this.termino.set(valor);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const t = this.termino().trim();

    if (!t) {
      this.busqueda.limpiar();
      this.limpiar.emit();
      this.buscar.emit('');
      this.router.navigate(['/productos']);
      return;
    }

    this.enviar.emit(t);
    this.buscar.emit(t);
    this.busqueda.establecer(t);
    this.router.navigate(['/productos'], { queryParams: { q: t } });
  }

  onLimpiar(): void {
    this.termino.set('');
    this.limpiar.emit();
    this.buscar.emit('');
    this.busqueda.limpiar();
    this.router.navigate(['/productos']);
  }
}
