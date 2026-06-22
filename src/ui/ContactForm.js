import { analyticsService } from '../services/analyticsService.js';
import { contactService } from '../services/contactService.js';

export class ContactForm {
  constructor() {
    this.form = document.getElementById('engineering-contact-form');
    this.statusEl = document.getElementById('form-status');
    this.ctaButtons = document.querySelectorAll('.btn-cta-track');
    this.verticalSelect = document.getElementById('contact-service');
    this.sectorSelect = document.getElementById('contact-sector');

    this.init();
  }

  init() {
    if (!this.form) return;

    // Hook CTA buttons to update form states & dispatch telemetry
    this.ctaButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ctaType = btn.getAttribute('data-cta');
        analyticsService.trackCTA(ctaType);

        // Adjust form dropdowns based on clicked CTAs
        if (ctaType === 'support' && this.verticalSelect) {
          this.verticalSelect.value = 'engineering';
        } else if (ctaType === 'consultation' && this.verticalSelect) {
          this.verticalSelect.value = 'completions';
        }
        
        // Scroll to form smoothly
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Form submit listener
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors();

      // Get Form Data
      const formData = new FormData(this.form);
      const name = formData.get('name').trim();
      const email = formData.get('email').trim();
      const company = formData.get('company').trim();
      const sector = formData.get('sector');
      const service = formData.get('service');
      const message = formData.get('message').trim();
      const honeypot = formData.get('company_website_url_check');

      // 1. Honeypot check
      if (honeypot) {
        console.warn('[ContactForm] Spam detected via honeypot field.');
        this.showStatus('Spam detected.', 'error');
        return;
      }

      // 2. Validation
      let hasError = false;

      if (!name) {
        this.showError('name');
        hasError = true;
      }
      if (!email || !this.validateEmail(email)) {
        this.showError('email');
        hasError = true;
      }
      if (!company) {
        this.showError('company');
        hasError = true;
      }
      if (!sector) {
        this.showError('sector');
        hasError = true;
      }
      if (!service) {
        this.showError('service');
        hasError = true;
      }
      if (!message) {
        this.showError('message');
        hasError = true;
      }

      if (hasError) return;

      // 3. Rate limiting check
      if (contactService.isRateLimited()) {
        this.showStatus('Too many requests. Please wait a few minutes before submitting again.', 'error');
        return;
      }

      // Submit Form
      this.showStatus('Sending scoping request...', 'success');
      const payload = { name, email, company, sector, service, message };

      try {
        const response = await contactService.submitRequest(payload);
        if (response.success) {
          this.showStatus('Request submitted successfully. Our engineers will get in touch.', 'success');
          this.form.reset();
          analyticsService.trackFormSubmission('success');
        } else {
          this.showStatus('Submission failed: ' + response.message, 'error');
          analyticsService.trackFormSubmission('failed');
        }
      } catch (err) {
        console.error('[ContactForm] Error submitting:', err);
        this.showStatus('Connection error. Please try again later.', 'error');
        analyticsService.trackFormSubmission('error');
      }
    });
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showError(field) {
    const parent = document.getElementById(`err-${field}`).parentNode;
    if (parent) {
      parent.classList.add('invalid');
    }
  }

  clearErrors() {
    const groups = this.form.querySelectorAll('.form-group');
    groups.forEach(g => g.classList.remove('invalid'));
    this.statusEl.style.display = 'none';
  }

  showStatus(msg, type) {
    this.statusEl.className = `form-status ${type}`;
    this.statusEl.textContent = msg;
  }
}

export default ContactForm;
