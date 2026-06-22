export const ENV = {
  GA_ID: import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX',
  CLARITY_ID: import.meta.env.VITE_CLARITY_ID || 'xxxxxxxxxx',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  ZOHO_WEBHOOK: import.meta.env.VITE_ZOHO_WEBHOOK || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api'
};
