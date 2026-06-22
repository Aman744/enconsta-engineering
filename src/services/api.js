import { ENV } from '../config/env.js';

export const api = {
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  },

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${ENV.API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'API Request failed' }));
      throw new Error(err.message || 'API Error');
    }
    
    return response.json();
  }
};

export default api;
