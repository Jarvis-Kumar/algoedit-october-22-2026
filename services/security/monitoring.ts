import { isDev } from '../config';

/**
 * Enterprise Google Analytics & Sentry Integrated Interface
 * Designed to cleanly handle both client-side and server-side contexts.
 */
class EnterpriseMonitoringEngine {
  private analyticsId: string = 'G-AI-MEDIA-STUDIO';
  private sentryDsn: string = 'https://sentry.ai-media.studio/project/102';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      // 1. Google Analytics Initialization (Client Side)
      const isProductionProdDomain = typeof window !== 'undefined' && 
        window.location.hostname === 'ai-media.studio';
      if (!isDev && isProductionProdDomain) {
        try {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsId}`;
          document.head.appendChild(script);

          (window as any).dataLayer = (window as any).dataLayer || [];
          const gtag = function(...args: any[]) {
            (window as any).dataLayer.push(arguments);
          };
          (window as any).gtag = gtag;
          (window as any).gtag('js', new Date());
          (window as any).gtag('config', this.analyticsId, {
            cookie_flags: 'SameSite=None;Secure',
            anonymize_ip: true
          });
          
          console.log('[Monitoring] Google Analytics initialized successfully.');
        } catch (e) {
          console.warn('[Monitoring] Failed to mount GA script tag:', e);
        }
      } else {
        console.log('[Monitoring] Sandbox detected. Google Analytics running in Simulator/Dev mode.');
      }

      // 2. Client Global Error Catching (Sentry Fallback)
      window.addEventListener('error', (event) => {
        if (event.message === 'Script error.' || event.message === 'Script error' || !event.error) {
          return; // Ignore useless third-party cross-origin script errors
        }
        this.captureException(event.error || new Error(event.message), {
          source: 'window_global_error',
          filename: event.filename,
          lineno: event.lineno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reasonStr = String(event.reason);
        if (reasonStr.includes('Script error') || reasonStr.includes('ResizeObserver loop completed with undelivered notifications')) {
          return; // Ignore standard benign/third-party errors
        }
        this.captureException(new Error(reasonStr), {
          source: 'unhandled_promise_rejection'
        });
      });
    }
  }

  /**
   * Capture exceptions and send them to the visual logger and error boundary (Sentry pattern)
   */
  public captureException(error: Error, context?: Record<string, any>) {
    if (!error || error.message === 'Script error.' || error.message === 'Script error' || error.message?.includes('Script error')) {
      return; // Ignore useless third-party cross-origin script errors
    }
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      sentryDsn: this.sentryDsn
    };

    if (typeof window !== 'undefined') {
      // Log on client
      console.warn(`[SENTRY_CAPTURE] Exception reported: "${error.message}"`, errorLog);
      
      // Store in memory queue for developer dashboard preview if available
      const queue = (window as any)._sentry_errors || [];
      queue.unshift(errorLog);
      if (queue.length > 50) queue.pop();
      (window as any)._sentry_errors = queue;
    } else {
      // Log on Node server
      console.error(`[SENTRY_SERVER_LOG] [Exception] ${error.message}`, JSON.stringify(errorLog));
    }
  }

  /**
   * Track custom behavioral events (Google Analytics pattern)
   */
  public trackEvent(eventName: string, params?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', eventName, params);
      }
      
      console.log(`[GA_TRACK] Event: "${eventName}"`, params);

      // Store in memory queue for developer dashboard preview
      const queue = (window as any)._ga_events || [];
      queue.unshift({ eventName, params, timestamp: new Date().toISOString() });
      if (queue.length > 50) queue.pop();
      (window as any)._ga_events = queue;
    } else {
      console.log(`[GA_SERVER_TRACK] Event: "${eventName}"`, JSON.stringify(params));
    }
  }

  /**
   * Measure API performance times
   */
  public measurePerformance(label: string, durationMs: number) {
    this.trackEvent('performance_latency', { label, durationMs });
    
    if (typeof window !== 'undefined') {
      const queue = (window as any)._perf_metrics || [];
      queue.unshift({ label, durationMs, timestamp: new Date().toISOString() });
      if (queue.length > 100) queue.pop();
       (window as any)._perf_metrics = queue;
    }
  }
}

export const monitor = new EnterpriseMonitoringEngine();
