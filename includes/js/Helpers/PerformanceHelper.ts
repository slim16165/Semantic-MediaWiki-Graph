/**
 * Performance optimization utilities
 * - Debouncing
 * - Throttling
 * - Memoization
 * - Virtual scrolling
 */

/**
 * Debounce function - delays execution until after wait time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}

/**
 * Memoization cache
 */
const memoCache = new Map<string, any>();

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : JSON.stringify(args);

    if (memoCache.has(key)) {
      return memoCache.get(key);
    }

    const result = func(...args);
    memoCache.set(key, result);
    return result;
  }) as T;
}

/**
 * Clear memoization cache
 */
export function clearMemoCache(): void {
  memoCache.clear();
}

/**
 * Intersection Observer for lazy loading
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private callbacks: Map<Element, () => void> = new Map();

  constructor(options?: IntersectionObserverInit) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const callback = this.callbacks.get(entry.target);
              if (callback) {
                callback();
                this.observer?.unobserve(entry.target);
                this.callbacks.delete(entry.target);
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
          ...options
        }
      );
    }
  }

  observe(element: Element, callback: () => void): void {
    if (this.observer) {
      this.callbacks.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback: execute immediately if IntersectionObserver not available
      callback();
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.callbacks.delete(element);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

/**
 * Virtual scrolling for large lists
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop: number = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    visibleCount: number
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.totalCount = 0;
  }

  setTotalCount(count: number): void {
    this.totalCount = count;
    this.update();
  }

  getVisibleRange(): { start: number; end: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = Math.min(start + this.visibleCount, this.totalCount);
    return { start, end };
  }

  update(): void {
    const { start, end } = this.getVisibleRange();
    // Trigger update event
    this.container.dispatchEvent(
      new CustomEvent('virtual-scroll-update', {
        detail: { start, end, total: this.totalCount }
      })
    );
  }

  onScroll(scrollTop: number): void {
    this.scrollTop = scrollTop;
    this.update();
  }
}

