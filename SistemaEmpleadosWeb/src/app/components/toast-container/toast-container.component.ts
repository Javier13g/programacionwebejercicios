import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1100; max-width: 420px;"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast show mb-2 shadow-lg text-white border-0"
          [class]="'bg-' + bgClass(toast.type)"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div
            class="toast-header text-white border-0"
            [class]="'bg-' + bgClass(toast.type)"
          >
            <i class="bi me-2" [class]="iconFor(toast.type)"></i>
            <strong class="me-auto">{{ toast.title }}</strong>
            <button
              type="button"
              class="btn-close btn-close-white"
              (click)="dismiss(toast.id)"
              aria-label="Cerrar"
            ></button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  iconFor(type: ToastType): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-exclamation-triangle-fill';
      case 'warning': return 'bi-exclamation-circle-fill';
      case 'info':
      default: return 'bi-info-circle-fill';
    }
  }

  bgClass(type: ToastType): string {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info':
      default: return 'info';
    }
  }
}
