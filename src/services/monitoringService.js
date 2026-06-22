import { ENV } from '../config/env.js';
import EventBus from '../core/EventBus.js';

class MonitoringService {
  constructor() {
    this.dsn = ENV.SENTRY_DSN;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    console.log(`[MonitoringService] Connecting monitoring agent. Sentry DSN: ${this.dsn || 'Simulated'}`);

    window.addEventListener('error', (e) => {
      this.captureError(e.error || e.message);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.captureError(e.reason);
    });

    // Hook WebGL Context Loss event
    EventBus.on('webgl:contextlost', () => {
      this.captureError(new Error('WebGL Context Lost event triggered by browser.'));
    });

    this.initialized = true;
  }

  captureError(error) {
    this.init();
    console.error('[MonitoringService] Caught Exception:', error);
    // In production: Sentry.captureException(error)
  }

  logInfo(msg) {
    this.init();
    console.info('[MonitoringService] Log Info:', msg);
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;
