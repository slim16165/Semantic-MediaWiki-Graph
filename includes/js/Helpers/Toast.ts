/**
 * Toast notifications for user feedback
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  dismissible?: boolean;
}

export class Toast {
  private static container: HTMLElement | null = null;
  private static toasts: HTMLElement[] = [];

  /**
   * Initialize toast container
   */
  private static initContainer(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'smwgraph-toast-container';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  /**
   * Show toast notification
   */
  static show(
    message: string,
    type: ToastType = 'info',
    options: ToastOptions = {}
  ): void {
    this.initContainer();
    if (!this.container) return;

    const {
      duration = 5000,
      position = 'top-right',
      dismissible = true
    } = options;

    const toast = document.createElement('div');
    toast.className = `smwgraph-toast smwgraph-toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const icon = this.getIcon(type);
    const messageEl = document.createElement('span');
    messageEl.className = 'smwgraph-toast-message';
    messageEl.textContent = message;

    toast.innerHTML = `
      <div class="smwgraph-toast-content">
        ${icon}
        ${messageEl.outerHTML}
        ${dismissible ? '<button class="smwgraph-toast-close" aria-label="Close">&times;</button>' : ''}
      </div>
    `;

    // Add close handler
    if (dismissible) {
      const closeBtn = toast.querySelector('.smwgraph-toast-close');
      closeBtn?.addEventListener('click', () => this.hide(toast));
    }

    // Position
    this.container.className = `smwgraph-toast-container smwgraph-toast-${position}`;
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('smwgraph-toast-show');
    });

    // Auto-hide
    if (duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }
  }

  /**
   * Hide toast
   */
  private static hide(toast: HTMLElement): void {
    toast.classList.remove('smwgraph-toast-show');
    toast.classList.add('smwgraph-toast-hide');
    
    setTimeout(() => {
      toast.remove();
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Get icon for toast type
   */
  private static getIcon(type: ToastType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return `<span class="smwgraph-toast-icon">${icons[type]}</span>`;
  }

  /**
   * Success toast
   */
  static success(message: string, options?: ToastOptions): void {
    this.show(message, 'success', options);
  }

  /**
   * Error toast
   */
  static error(message: string, options?: ToastOptions): void {
    this.show(message, 'error', { ...options, duration: options?.duration || 7000 });
  }

  /**
   * Warning toast
   */
  static warning(message: string, options?: ToastOptions): void {
    this.show(message, 'warning', options);
  }

  /**
   * Info toast
   */
  static info(message: string, options?: ToastOptions): void {
    this.show(message, 'info', options);
  }
}

