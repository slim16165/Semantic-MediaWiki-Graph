/**
 * Error Tracking and Reporting
 * Integrates with error tracking services (Sentry, etc.)
 */

export interface ErrorContext {
  user?: string;
  url?: string;
  userAgent?: string;
  timestamp?: number;
  [key: string]: any;
}

export class ErrorTracker {
  private errorQueue: Error[] = [];
  private context: ErrorContext = {};
  private maxQueueSize: number = 50;

  constructor() {
    this.initGlobalErrorHandling();
  }

  private initGlobalErrorHandling(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        { type: 'unhandledrejection' }
      );
    });
  }

  /**
   * Set error context
   */
  setContext(context: ErrorContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Capture an error
   */
  captureError(error: Error, additionalContext?: Record<string, any>): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: {
        ...this.context,
        ...additionalContext,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    // Add to queue
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error captured:', errorData);
    }

    // Dispatch event for external error tracking services
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('error-captured', {
          detail: errorData
        })
      );
    }

    // Send to error tracking service (e.g., Sentry)
    this.sendToErrorService(errorData);
  }

  /**
   * Send error to external service
   */
  private sendToErrorService(errorData: any): void {
    // Integration with Sentry or other services
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorData.context });
    // }

    // For now, just log
    console.error('Error tracking:', errorData);
  }

  /**
   * Get error queue
   */
  getErrors(): Error[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clear(): void {
    this.errorQueue = [];
  }
}

