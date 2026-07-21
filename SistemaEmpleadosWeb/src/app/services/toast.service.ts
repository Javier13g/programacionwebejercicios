import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(
    type: ToastType,
    message: string,
    options: { title?: string; duration?: number } = {}
  ): number {
    const id = ++this.nextId;
    const defaultDuration = type === 'error' ? 0 : 5000;
    const toast: Toast = {
      id,
      type,
      title: options.title ?? this.defaultTitle(type),
      message,
      duration: options.duration ?? defaultDuration
    };
    this.toasts.update(list => [...list, toast]);

    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
    return id;
  }

  success(message: string, options?: { title?: string; duration?: number }): number {
    return this.show('success', message, options);
  }

  error(message: string, options?: { title?: string; duration?: number }): number {
    return this.show('error', message, options);
  }

  warning(message: string, options?: { title?: string; duration?: number }): number {
    return this.show('warning', message, options);
  }

  info(message: string, options?: { title?: string; duration?: number }): number {
    return this.show('info', message, options);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private defaultTitle(type: ToastType): string {
    return {
      success: 'Éxito',
      error: 'Error',
      warning: 'Atención',
      info: 'Información'
    }[type];
  }
}
