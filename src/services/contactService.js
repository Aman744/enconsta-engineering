import { ENV } from '../config/env.js';

class ContactService {
  constructor() {
    this.rateLimitDuration = 60 * 1000; // 1 minute rate limit
    this.dailyLimitCount = 3;
  }

  isRateLimited() {
    const lastSubmit = localStorage.getItem('enconsta_last_submit');
    const dailySubmits = JSON.parse(localStorage.getItem('enconsta_daily_submits') || '[]');

    const now = Date.now();

    // 1-minute rate check
    if (lastSubmit && (now - parseInt(lastSubmit, 10)) < this.rateLimitDuration) {
      return true;
    }

    // 24-hour rate check
    const recentSubmits = dailySubmits.filter(timestamp => (now - timestamp) < 24 * 60 * 60 * 1000);
    localStorage.setItem('enconsta_daily_submits', JSON.stringify(recentSubmits));
    if (recentSubmits.length >= this.dailyLimitCount) {
      return true;
    }

    return false;
  }

  recordSubmission() {
    const now = Date.now();
    localStorage.setItem('enconsta_last_submit', now.toString());

    const dailySubmits = JSON.parse(localStorage.getItem('enconsta_daily_submits') || '[]');
    dailySubmits.push(now);
    localStorage.setItem('enconsta_daily_submits', JSON.stringify(dailySubmits));
  }

  async submitRequest(payload) {
    if (this.isRateLimited()) {
      return { success: false, message: 'Submission rate limit exceeded. Please try again later.' };
    }

    try {
      // In production, fetch to Cloudflare function endpoint /functions/contact
      const response = await fetch(`${ENV.API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      this.recordSubmission();

      if (response.ok) {
        return { success: true };
      } else {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || 'Server error occurred.' };
      }
    } catch (err) {
      console.warn('[ContactService] Endpoint offline or connection refused. Falling back to local simulation during development...');
      
      // Simulate success for local preview and testing if backend is not set up
      this.recordSubmission();
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    }
  }
}

export const contactService = new ContactService();
export default contactService;
