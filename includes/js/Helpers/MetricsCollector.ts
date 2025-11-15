/**
 * Metrics and Performance Monitoring
 * Collects Web Vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitals = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initWebVitals();
    this.initCustomMetrics();
  }

  private initWebVitals(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.webVitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.recordMetric('lcp', this.webVitals.lcp);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.webVitals.fid = entry.processingStart - entry.startTime;
          this.recordMetric('fid', this.webVitals.fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.webVitals.cls = clsValue;
            this.recordMetric('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  private initCustomMetrics(): void {
    // Measure graph rendering time
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark('graph-render-start');
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    });

    // Dispatch event for external monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('metric-recorded', {
          detail: { name, value, tags }
        })
      );
    }
  }

  /**
   * Measure graph rendering performance
   */
  measureGraphRender(callback: () => void): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      callback();
      return;
    }

    const startMark = 'graph-render-start';
    const endMark = 'graph-render-end';
    const measureName = 'graph-render';

    performance.mark(startMark);
    callback();
    performance.mark(endMark);

    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      this.recordMetric('graph-render-time', measure.duration);
    } catch (e) {
      console.warn('Performance measurement failed:', e);
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get Web Vitals
   */
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.webVitals = {};
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

