import { ENV } from '../config/env.js';

class AnalyticsService {
  constructor() {
    this.gaId = ENV.GA_ID;
    this.clarityId = ENV.CLARITY_ID;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    // Simulate initializing third-party analytics pixels
    console.log(`[AnalyticsService] Initializing analytics with GA: ${this.gaId}, Clarity: ${this.clarityId}`);
    
    // Inject scripts theoretically in production:
    // window.gtag = ...
    // window.clarity = ...
    this.initialized = true;
  }

  trackCTA(type) {
    this.init();
    console.log(`[AnalyticsService] Track CTA click: ${type}`);
    
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: type
      });
    }

    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'cta_click',
        ctaType: type
      });
    }
  }

  trackFormSubmission(status) {
    this.init();
    console.log(`[AnalyticsService] Track Form submission: ${status}`);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'form_submission', {
        event_category: 'lead_generation',
        event_label: status
      });
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
