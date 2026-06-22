import { executives } from '../content/executives.js';

export class TeamModal {
  constructor() {
    this.container = document.getElementById('executives-target');
    this.activeModal = null;
    this.init();
  }

  init() {
    if (!this.container) return;

    // Render leadership hierarchy
    this.renderHierarchy();

    // Setup modal preview overlays
    this.setupPreviews();
  }

  renderHierarchy() {
    const ceo = executives.filter(e => e.hierarchy === 'CEO');
    const directors = executives.filter(e => e.hierarchy === 'Engineering Director');
    const heads = executives.filter(e => e.hierarchy === 'Discipline Head');

    let html = `
      <!-- CEO Level -->
      <div class="hierarchy-level">
        ${ceo.map(e => this.createCardHtml(e)).join('')}
      </div>

      <!-- Director Level -->
      <div class="hierarchy-level">
        ${directors.map(e => this.createCardHtml(e)).join('')}
      </div>

      <!-- Heads Level -->
      <div class="hierarchy-level">
        ${heads.map(e => this.createCardHtml(e)).join('')}
      </div>
    `;

    this.container.innerHTML = html;
  }

  createCardHtml(exec) {
    const initials = exec.name.split(' ').map(n => n[0]).join('');
    return `
      <div class="executive-card" data-slug="${exec.slug}">
        <div class="executive-card-inner">
          <div class="exec-portrait-avatar">${initials}</div>
          <h4 class="exec-name">${exec.name}</h4>
          <p class="exec-designation">${exec.designation}</p>
          <div class="exec-actions" style="margin-bottom: 12px;">
            <a href="/team/${exec.slug}/" class="btn btn-outline btn-sm" style="padding: 6px 12px; font-size: 0.75rem; display: inline-block;">Full Profile</a>
          </div>
          <span class="exec-link-btn">Quick Preview</span>
        </div>
      </div>
    `;
  }

  setupPreviews() {
    const cards = this.container.querySelectorAll('.executive-card');
    cards.forEach(card => {
      const slug = card.getAttribute('data-slug');
      const exec = executives.find(e => e.slug === slug);
      
      const previewTrigger = card.querySelector('.exec-link-btn');
      if (previewTrigger) {
        previewTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openPreview(exec);
        });
      }
    });
  }

  openPreview(exec) {
    // If modal already open, close it
    this.closePreview();

    const modal = document.createElement('div');
    modal.className = 'team-preview-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background-color: rgba(3, 12, 30, 0.9);
      backdrop-filter: blur(10px);
      z-index: 500;
      display: flex; justify-content: center; align-items: center;
    `;

    const initials = exec.name.split(' ').map(n => n[0]).join('');

    modal.innerHTML = `
      <div class="team-preview-content bg-light text-dark" style="
        width: 90%; max-width: 600px;
        padding: 40px; border-radius: 8px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        position: relative;
        border-top: 4px solid var(--color-accent);
      ">
        <button class="close-modal-btn" style="
          position: absolute; top: 15px; right: 20px;
          background: none; border: none; font-size: 1.5rem;
          cursor: pointer; color: var(--color-text-muted);
        ">&times;</button>
        
        <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 24px;">
          <div style="
            width: 70px; height: 70px; border-radius: 50%;
            background-color: var(--color-primary); color: #FFF;
            display: flex; justify-content: center; align-items: center;
            font-weight: 700; font-size: 1.25rem;
          ">${initials}</div>
          <div>
            <h3 style="color: var(--color-primary); margin: 0;">${exec.name}</h3>
            <p style="color: var(--color-accent); margin: 0; font-size: 0.9rem; font-weight: 600;">${exec.designation}</p>
          </div>
        </div>

        <p style="margin-bottom: 20px; font-size: 0.95rem;">${exec.bio}</p>

        <div style="margin-bottom: 20px;">
          <strong style="display: block; font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 6px;">Key Expertise</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${exec.expertise.map(exp => `
              <span style="font-size: 0.75rem; background-color: rgba(6, 26, 64, 0.05); padding: 4px 10px; border-radius: 4px;">${exp}</span>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <a href="/team/${exec.slug}/" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.85rem;">View Full Bio Page</a>
          <a href="${exec.linkedin}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 10px 20px; font-size: 0.85rem; border-color: rgba(6, 26, 64, 0.2); color: var(--color-primary);">LinkedIn Profile</a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.activeModal = modal;

    // Handle close clicks
    modal.querySelector('.close-modal-btn').addEventListener('click', () => this.closePreview());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closePreview();
    });

    // Keyboard accessibility Escape close
    this.escListener = (e) => {
      if (e.key === 'Escape') this.closePreview();
    };
    window.addEventListener('keydown', this.escListener);
  }

  closePreview() {
    if (this.activeModal) {
      document.body.removeChild(this.activeModal);
      this.activeModal = null;
      window.removeEventListener('keydown', this.escListener);
    }
  }
}

export default TeamModal;
