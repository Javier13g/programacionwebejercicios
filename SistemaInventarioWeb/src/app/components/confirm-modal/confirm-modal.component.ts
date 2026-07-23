import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Modal de confirmacion reutilizable.
 *
 * Uso:
 *   const modalRef = modalService.open(ConfirmModalComponent, { centered: true });
 *   modalRef.componentInstance.title = '¿Estas seguro?';
 *   modalRef.componentInstance.body = 'Esta accion no se puede deshacer.';
 *   modalRef.closed.subscribe((ok: boolean) => { ... });
 *
 * Resultado:
 *   - Click en confirmar -> close(true)
 *   - Click en cancelar / backdrop -> close(false)
 *   - Escape -> dismiss (no se ejecuta nada)
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, NgbModalModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  @Input() title = '¿Confirmar?';
  @Input() body = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  /** 'btn-danger' | 'btn-primary' | 'btn-warning' */
  @Input() confirmClass: 'btn-danger' | 'btn-primary' | 'btn-warning' = 'btn-primary';
  /** Icono de bootstrap-icons a mostrar (sin prefijo 'bi-'). Ej: 'trash', 'image', 'check-circle'. */
  @Input() icon: string | null = null;

  constructor(public readonly activeModal: NgbActiveModal) {}

  confirmar(): void {
    this.activeModal.close(true);
  }

  cancelar(): void {
    this.activeModal.close(false);
  }
}
