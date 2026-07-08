import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../models/producto.model';

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-menu.component.html',
  styleUrl: './category-menu.component.css',
})
export class CategoryMenuComponent {
  @Input({ required: true }) categorias: Categoria[] = [];
  @Input() activa: string | null = null;
  @Input() modo: 'pills' | 'sidebar' = 'pills';

  @Output() seleccionar = new EventEmitter<string>();

  iconoPara(id: string): string {
    const iconos: Record<string, string> = {
      action: '⚔',
      rpg: '🛡',
      adventure: '🗺',
      strategy: '♟',
      indie: '✦',
      shooter: '🎯',
      puzzle: '🧩',
      racing: '🏎',
      sports: '⚽',
    };
    return iconos[id] ?? '◆';
  }

  onClick(id: string): void {
    this.seleccionar.emit(id);
  }
}
