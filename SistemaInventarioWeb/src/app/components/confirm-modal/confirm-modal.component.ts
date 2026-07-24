import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

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
  @Input() confirmClass: 'btn-danger' | 'btn-primary' | 'btn-warning' = 'btn-primary';
  @Input() icon: string | null = null;

  constructor(public readonly activeModal: NgbActiveModal) {}

  confirmar(): void {
    this.activeModal.close(true);
  }

  cancelar(): void {
    this.activeModal.close(false);
  }
}
