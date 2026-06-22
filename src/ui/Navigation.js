import EventBus from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

export class Navigation {
  constructor() {
    this.header = document.querySelector('.header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.mobileToggle = document.querySelector('.mobile-nav-toggle');
    this.nav = document.querySelector('.nav');
    
    this.init();
  }

  init() {
    // Scroll header scroll threshold
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    });

    // Mobile nav toggle
    if (this.mobileToggle && this.nav) {
      this.mobileToggle.addEventListener('click', () => {
        const expanded = this.mobileToggle.getAttribute('aria-expanded') === 'true';
        this.mobileToggle.setAttribute('aria-expanded', !expanded);
        this.nav.classList.toggle('mobile-open');
      });
    }

    // ScrollSpy active link sync
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
      let current = 'hero';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute('id');
        }
      });

      StateManager.setCurrentSection(current);
    });

    // Listen to StateManager active changes
    EventBus.on('state:currentSection', ({ value }) => {
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${value}` || (value === 'hero' && href === '#')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  }
}

export default Navigation;
