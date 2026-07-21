import { Injectable, inject } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmDialogComponent,
  ConfirmVariant
} from '../components/confirm-dialog/confirm-dialog.component';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: string;
}

/**
 * Servicio que envuelve `NgbModal` para abrir diálogos de confirmación
 * con la misma API sencilla que el `confirm()` nativo del navegador.
 *
 * Uso:
 *   const ok = await this.confirm.ask({ message: '¿...?', variant: 'danger' });
 *   if (!ok) return;
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly modal = inject(NgbModal);

  ask(options: ConfirmOptions): Promise<boolean> {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: true,
      centered: true,
      size: 'md'
    };

    const ref = this.modal.open(ConfirmDialogComponent, modalOptions);

    ref.componentInstance.title = options.title ?? '¿Estás seguro?';
    ref.componentInstance.message = options.message;
    ref.componentInstance.confirmText = options.confirmText ?? 'Aceptar';
    ref.componentInstance.cancelText = options.cancelText ?? 'Cancelar';
    ref.componentInstance.variant = options.variant ?? 'primary';
    ref.componentInstance.icon = options.icon ?? 'question-circle';

    return ref.result.catch(() => false) as Promise<boolean>;
  }
}
