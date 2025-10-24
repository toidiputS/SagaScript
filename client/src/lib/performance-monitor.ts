/**
 * Performance monitoring utilities for the profile page
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PageLoadMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    // Observe paint metrics
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              metadata: { entryType: entry.entryType }
            });
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Paint observer not supported:', error);
      }

      // Observe LCP
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            metadata: { 
              element: lastEntry.element?.tagName,
              size: lastEntry.size 
            }
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // Observe CLS
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.recordMetric({
            name: 'cumulative-layout-shift',
            value: clsValue,
            timestamp: Date.now()
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // Observe FID
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'first-input-delay',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              metadata: { 
                inputType: entry.name,
                target: entry.target?.tagName 
              }
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Log important metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${metric.name} = ${metric.value.toFixed(2)}ms`, metric.metadata);
    }
  }

  /**
   * Mark the start of a custom timing
   */
  markStart(name: string) {
    if ('performance' in window && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * Mark the end of a custom timing and record the duration
   */
  markEnd(name: string, metadata?: Record<string, any>) {
    if ('performance' in window && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        this.recordMetric({
          name,
          value: measure.duration,
          timestamp: Date.now(),
          metadata
        });
      }
    }
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics(): PageLoadMetrics | null {
    if (!('performance' in window) || !performance.timing) {
      return null;
    }

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      navigationStart: timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstContentfulPaint: this.getMetricValue('first-contentful-paint'),
      largestContentfulPaint: this.getMetricValue('largest-contentful-paint'),
      cumulativeLayoutShift: this.getMetricValue('cumulative-layout-shift'),
      firstInputDelay: this.getMetricValue('first-input-delay'),
    };
  }

  /**
   * Get a specific metric value
   */
  private getMetricValue(name: string): number | undefined {
    const metric = this.metrics.find(m => m.name === name);
    return metric?.value;
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    if ('performance' in window && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Generate a performance report
   */
  generateReport(): string {
    const pageMetrics = this.getPageLoadMetrics();
    const customMetrics = this.getAllMetrics();

    let report = '=== Profile Page Performance Report ===\n\n';

    if (pageMetrics) {
      report += 'Page Load Metrics:\n';
      report += `- DOM Content Loaded: ${pageMetrics.domContentLoaded.toFixed(2)}ms\n`;
      report += `- Load Complete: ${pageMetrics.loadComplete.toFixed(2)}ms\n`;
      
      if (pageMetrics.firstContentfulPaint) {
        report += `- First Contentful Paint: ${pageMetrics.firstContentfulPaint.toFixed(2)}ms\n`;
      }
      
      if (pageMetrics.largestContentfulPaint) {
        report += `- Largest Contentful Paint: ${pageMetrics.largestContentfulPaint.toFixed(2)}ms\n`;
      }
      
      if (pageMetrics.cumulativeLayoutShift) {
        report += `- Cumulative Layout Shift: ${pageMetrics.cumulativeLayoutShift.toFixed(4)}\n`;
      }
      
      if (pageMetrics.firstInputDelay) {
        report += `- First Input Delay: ${pageMetrics.firstInputDelay.toFixed(2)}ms\n`;
      }
      
      report += '\n';
    }

    if (customMetrics.length > 0) {
      report += 'Custom Metrics:\n';
      customMetrics.forEach(metric => {
        report += `- ${metric.name}: ${metric.value.toFixed(2)}ms\n`;
      });
    }

    return report;
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for easy integration
export function usePerformanceMonitor() {
  return {
    markStart: performanceMonitor.markStart.bind(performanceMonitor),
    markEnd: performanceMonitor.markEnd.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getPageLoadMetrics: performanceMonitor.getPageLoadMetrics.bind(performanceMonitor),
    getAllMetrics: performanceMonitor.getAllMetrics.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
}

// Utility functions for common performance measurements
export const ProfilePerformance = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, renderFn: () => void) => {
    performanceMonitor.markStart(`${componentName}-render`);
    renderFn();
    performanceMonitor.markEnd(`${componentName}-render`, { component: componentName });
  },

  /**
   * Measure API request time
   */
  measureApiRequest: async <T>(name: string, requestFn: () => Promise<T>): Promise<T> => {
    performanceMonitor.markStart(`api-${name}`);
    try {
      const result = await requestFn();
      performanceMonitor.markEnd(`api-${name}`, { endpoint: name, success: true });
      return result;
    } catch (error) {
      performanceMonitor.markEnd(`api-${name}`, { endpoint: name, success: false, error: error.message });
      throw error;
    }
  },

  /**
   * Measure image load time
   */
  measureImageLoad: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        performanceMonitor.recordMetric({
          name: 'image-load',
          value: loadTime,
          timestamp: Date.now(),
          metadata: { src, success: true }
        });
        resolve();
      };
      
      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        performanceMonitor.recordMetric({
          name: 'image-load',
          value: loadTime,
          timestamp: Date.now(),
          metadata: { src, success: false }
        });
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  },

  /**
   * Measure tab switch time
   */
  measureTabSwitch: (fromTab: string, toTab: string, switchFn: () => void) => {
    performanceMonitor.markStart(`tab-switch-${fromTab}-to-${toTab}`);
    switchFn();
    performanceMonitor.markEnd(`tab-switch-${fromTab}-to-${toTab}`, { 
      fromTab, 
      toTab 
    });
  }
};