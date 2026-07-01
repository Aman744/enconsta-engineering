import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import StateManager from './core/StateManager.js';
import EventBus from './core/EventBus.js';
import AssetLoader from './core/AssetLoader.js';
import RenderManager from './core/RenderManager.js';
import SceneManager from './scene/SceneManager.js';
import LoaderScene from './scene/LoaderScene.js';

// UI Modules
import Layout from './ui/Layout.js';
import Navigation from './ui/Navigation.js';
import Counters from './ui/Counters.js';
import ContactForm from './ui/ContactForm.js';

// Content Lists
import { services } from './content/services.js';
import { offices } from './content/offices.js';
import { facilities } from './content/credentials.js';
import { executedProjects } from './content/executedProjects.js';

// Performance Service
import { performanceService } from './services/performanceService.js';
import { monitoringService } from './services/monitoringService.js';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.lenis = null;
    this.sceneManager = null;
    this.ui = {};

    // Periodic debugger to trace camera position and active children
    setInterval(() => {
      if (StateManager.get('bootComplete') && this.sceneManager) {
        const rig = this.sceneManager.scene.children.find(c => c.type === 'Group' || c.constructor.name === 'Group');
        console.log('[PERIODIC DEBUG]', {
          currentSection: StateManager.get('currentSection'),
          cameraPos: { x: this.sceneManager.camera.position.x, y: this.sceneManager.camera.position.y, z: this.sceneManager.camera.position.z },
          rigMounted: !!rig,
          rigVisible: rig ? rig.visible : false,
          rigPosition: rig ? { x: rig.position.x, y: rig.position.y, z: rig.position.z } : null
        });
      }
    }, 2000);

    this.init();
  }

  async init() {
    console.log('[Enconsta App] Initializing application framework...');

    // Initialize layout (global header & footer)
    new Layout();

    // Initialize custom cursor
    this.initCustomCursor();

    // Initialize observability logs
    monitoringService.init();
    performanceService.startTracking();

    const hasCanvas = !!document.getElementById('webgl-canvas');
    const isHomepage = hasCanvas && !!document.getElementById('universe');
    const isCapabilitiesPage = hasCanvas && !!document.querySelector('.capabilities-vertical-wrapper');

    if (isHomepage) {
      // Initialize WebGL Scene Manager first so 3D assets start loading immediately
      this.sceneManager = new SceneManager();

      // Render HTML content layers dynamically from content files
      this.renderDynamicContent();
      this.setupProjectTable();

      // Draw industry ecosystem nodes and connecting SVG paths
      this.setupEcosystemNetwork();

      // Initialize UI controllers
      this.ui.navigation = new Navigation();
      this.ui.counters = new Counters();
      this.ui.contactForm = new ContactForm();

      // Set up smooth scrolling via Lenis
      this.setupSmoothScroll();

      // Set up boot preloader
      this.setupPreloader();
    } else if (isCapabilitiesPage) {
      // Setup capabilities subpage with WebGL
      this.initServicesPage();

      // Force state to capabilities before instantiating SceneManager to bypass loading the Oil Rig
      StateManager.setCurrentSection('capabilities');

      // Initialize WebGL Scene Manager and capabilities transitions
      this.sceneManager = new SceneManager();
      this.setupCapabilitiesPageAnimations();
    } else {
      this.initServicesPage();
    }
  }

  renderDynamicContent() {
    // 1. Render Services
    const servicesTarget = document.getElementById('services-target');
    if (servicesTarget) {
      servicesTarget.innerHTML = services.map(s => `
        <a href="services/${s.id}/" class="service-card-link">
          <div class="service-card" id="service-${s.id}">
            <span class="service-icon">//</span>
            <h3 class="service-title">${s.title}</h3>
            <p class="service-subtitle">${s.subtitle}</p>
            <ul class="service-bullets">
              ${s.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
            <span class="service-card-cta">Explore Service &rarr;</span>
          </div>
        </a>
      `).join('');
    }

    // 2. Render Global Operations Offices
    const officesTarget = document.getElementById('offices-target');
    if (officesTarget) {
      officesTarget.innerHTML = offices.map(o => `
        <div class="office-info-card">
          <h4>${o.city}</h4>
        </div>
      `).join('');
    }

    // 3. Render Credentials Facilities covered
    const facilitiesTarget = document.getElementById('facilities-target');
    if (facilitiesTarget) {
      facilitiesTarget.innerHTML = facilities.map(f => `
        <div class="facility-card">
          <h4>${f.name}</h4>
          <p>${f.details}</p>
          <span>${f.spec}</span>
        </div>
      `).join('');
    }

  }

  setupSmoothScroll() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  setupPreloader() {
    // Initialize the self-assembling 3D preloader refinery
    this.loaderScene = new LoaderScene();

    // Register mock assets to load (in production this waits for fonts, SVGs, etc.)
    AssetLoader.add('font', 'Outfit', 'Outfit');
    AssetLoader.add('font', 'Inter', 'Inter');

    const progressBar = document.getElementById('boot-progress');
    const bootLoader = document.getElementById('boot-loader');

    // Console log steps
    const step1 = document.getElementById('console-step-1');
    const step2 = document.getElementById('console-step-2');
    const step3 = document.getElementById('console-step-3');
    const stepReady = document.getElementById('console-ready');

    AssetLoader.onProgress((progress) => {
      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }

      if (this.loaderScene) {
        this.loaderScene.updateProgress(progress);
      }

      // Simulate sequential log feedback based on loading milestones
      if (progress > 0.3) {
        step1.classList.remove('opacity-50');
        step1.classList.add('text-cyan');
      }
      if (progress > 0.6) {
        step2.classList.remove('opacity-50');
        step2.classList.add('text-cyan');
      }
      if (progress > 0.8) {
        step3.classList.remove('opacity-50');
        step3.classList.add('text-cyan');
      }
    });

    AssetLoader.onComplete(async () => {
      // Wait for initial WebGL assets (like Pipelines) to finish loading
      if (this.sceneManager && this.sceneManager.initialLoadPromise) {
        try {
          await this.sceneManager.initialLoadPromise;
        } catch (err) {
          console.error('[App] Failed to await initial 3D load:', err);
        }
      }

      // Ensure 3D loader registers 100% complete
      if (this.loaderScene) {
        this.loaderScene.updateProgress(1.0);
      }

      stepReady.classList.remove('opacity-0');
      stepReady.classList.add('text-green');

      setTimeout(() => {
        // Slide out boot screen
        if (bootLoader) {
          bootLoader.style.transform = 'translateY(-100%)';
          
          // Clean up 3D loader resources after transition completes (1s)
          setTimeout(() => {
            if (this.loaderScene) {
              this.loaderScene.destroy();
              this.loaderScene = null;
            }
          }, 1000);
        }
        StateManager.set('bootComplete', true);

        // Bind GSAP Scroll Animations
        this.setupScrollAnimations();

        // Start Hero Section rotating ticker
        this.startHeroTicker();
      }, 800);
    });

    // Begin Loading
    AssetLoader.loadAll();
  }

  startHeroTicker() {
    const sectors = [
      'Oil & Gas',
      'Refineries',
      'Petrochemicals',
      'Power Plants',
      'Solar energy',
      'Wind Energy',
      'Industrial Infrastructure'
    ];

    const tickerText = document.getElementById('ticker-text');
    if (!tickerText) return;

    let index = 0;
    setInterval(() => {
      gsap.to(tickerText, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          index = (index + 1) % sectors.length;
          tickerText.textContent = sectors[index];
          gsap.fromTo(tickerText,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3 }
          );
        }
      });
    }, 3000);
  }

  setupScrollAnimations() {
    // 1. Hero Zoom & Transition ScrollTrigger
    gsap.to(this.sceneManager.camera.position, {
      z: 25,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });



    // 3. Setup dynamic step highlighting in AI Digital Twin section
    const twinSteps = document.querySelectorAll('.twin-step');
    twinSteps.forEach((step, idx) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          twinSteps.forEach(s => s.classList.remove('active'));
          step.classList.add('active');
          // Emit event to update 3D UI panels if needed
          EventBus.emit('ai:stepchange', { step: idx + 1 });
        }
      });
    });

    // 4. Refinery Assembly (Section 2) static trigger
    ScrollTrigger.create({
      id: 'refinery-trigger',
      trigger: '.universe-canvas-trigger',
      start: 'top bottom',
      end: 'bottom center',
      scrub: 1.5,
      onUpdate: (self) => {
        EventBus.emit('refinery:assemble', self.progress);
      }
    });
  }

  setupEcosystemNetwork() {
    const mapEl = document.getElementById('ecosystem-network-map');
    if (!mapEl) return;

    const sectors = [
      'Refineries',
      'Petrochemicals',
      'LNG Facilities',
      'Solar Parks',
      'Wind Farms',
      'Power Plants',
      'Pipelines'
    ];

    // Inner HTML structure: central Enconsta node + surrounding nodes + SVG connection lines
    let html = `
      <svg id="eco-connections" style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none;"></svg>
      <div class="eco-node eco-node-center" id="node-center" style="left: calc(50% - 65px); top: calc(50% - 65px);">
        <span>ENCONSTA</span>
      </div>
    `;

    sectors.forEach((sec, i) => {
      const angle = (i * Math.PI * 2) / sectors.length;
      const radius = 130; // px radius
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      html += `
        <div class="eco-node" id="node-${i}" style="
          left: calc(50% - 55px + ${x}px);
          top: calc(50% - 55px + ${y}px);
        ">
          <span>${sec}</span>
        </div>
      `;
    });

    mapEl.innerHTML = html;

    // Draw connecting paths dynamically
    const drawLines = () => {
      const svg = document.getElementById('eco-connections');
      const centerNode = document.getElementById('node-center');
      if (!svg || !centerNode) return;

      const rectCenter = centerNode.getBoundingClientRect();
      const rectMap = mapEl.getBoundingClientRect();

      const cx = rectCenter.left - rectMap.left + rectCenter.width / 2;
      const cy = rectCenter.top - rectMap.top + rectCenter.height / 2;

      let paths = '';
      sectors.forEach((_, i) => {
        const node = document.getElementById(`node-${i}`);
        if (!node) return;

        const rectNode = node.getBoundingClientRect();
        const nx = rectNode.left - rectMap.left + rectNode.width / 2;
        const ny = rectNode.top - rectMap.top + rectNode.height / 2;

        paths += `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="rgba(6, 26, 64, 0.15)" stroke-width="2" stroke-dasharray="4,4" />`;
      });

      svg.innerHTML = paths;
    };

    setTimeout(drawLines, 100);
    window.addEventListener('resize', drawLines);
  }

  setupProjectTable() {
    const tableBody = document.getElementById('project-table-target');
    if (!tableBody) return;

    const searchInput = document.getElementById('project-search');
    const sectorFilter = document.getElementById('project-filter-sector');
    const statusFilter = document.getElementById('project-filter-status');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const indicator = document.getElementById('page-indicator');

    this.projectSearchQuery = '';
    this.projectFilterSector = 'all';
    this.projectFilterStatus = 'all';
    this.projectCurrentPage = 1;
    this.projectPageSize = 10;

    const renderTable = () => {
      // 1. Filter the projects
      let filtered = executedProjects.filter(p => {
        const matchesSearch = 
          p.client.toLowerCase().includes(this.projectSearchQuery) ||
          p.project.toLowerCase().includes(this.projectSearchQuery) ||
          p.location.toLowerCase().includes(this.projectSearchQuery);
        
        const matchesSector = this.projectFilterSector === 'all' || p.type.toLowerCase().includes(this.projectFilterSector.toLowerCase());
        const matchesStatus = this.projectFilterStatus === 'all' || p.status.toLowerCase() === this.projectFilterStatus.toLowerCase();

        return matchesSearch && matchesSector && matchesStatus;
      });

      // 2. Paginate
      const totalItems = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / this.projectPageSize));
      
      // Clamp page number
      if (this.projectCurrentPage > totalPages) this.projectCurrentPage = totalPages;
      if (this.projectCurrentPage < 1) this.projectCurrentPage = 1;

      const startIndex = (this.projectCurrentPage - 1) * this.projectPageSize;
      const paginated = filtered.slice(startIndex, startIndex + this.projectPageSize);

      // 3. Render HTML
      if (paginated.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 30px; opacity: 0.6;">No matching projects found.</td></tr>`;
      } else {
        tableBody.innerHTML = paginated.map(p => `
          <tr>
            <td style="font-weight: 600; color: var(--color-primary);">${p.client}</td>
            <td style="line-height: 1.5;">${p.project}</td>
            <td>${p.location}</td>
            <td><span class="sector-label" style="font-size: 0.75rem; background: rgba(6,26,64,0.03); padding: 2px 6px; border-radius: 4px;">${p.type}</span></td>
            <td>${p.service}</td>
            <td>${p.period}</td>
            <td><span class="status-tag ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span></td>
          </tr>
        `).join('');
      }

      // 4. Update UI controls
      if (indicator) {
        indicator.textContent = `Page ${this.projectCurrentPage} of ${totalPages}`;
      }
      if (prevBtn) {
        prevBtn.disabled = this.projectCurrentPage === 1;
      }
      if (nextBtn) {
        nextBtn.disabled = this.projectCurrentPage === totalPages;
      }
    };

    // Bind Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.projectSearchQuery = e.target.value.toLowerCase().trim();
        this.projectCurrentPage = 1; // Reset to page 1 on search
        renderTable();
      });
    }

    // Bind Sector Filter
    if (sectorFilter) {
      sectorFilter.addEventListener('change', (e) => {
        this.projectFilterSector = e.target.value;
        this.projectCurrentPage = 1;
        renderTable();
      });
    }

    // Bind Status Filter
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.projectFilterStatus = e.target.value;
        this.projectCurrentPage = 1;
        renderTable();
      });
    }

    // Bind Pagination Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.projectCurrentPage > 1) {
          this.projectCurrentPage--;
          renderTable();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.projectCurrentPage++;
        renderTable();
      });
    }

    // Initial render
    renderTable();
  }

  initServicesPage() {
    console.log('[Enconsta App] Initializing Services page context...');

    // Initialize contact form if present
    if (document.getElementById('engineering-contact-form')) {
      this.ui.contactForm = new ContactForm();
    }

    // 1. Initialize Lenis Smooth Scroll
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Global scroll helper
    window.scrollToElement = (selector) => {
      const target = document.querySelector(selector);
      if (target) this.lenis.scrollTo(target, { offset: -80, duration: 1.2 });
    };

    // 2. Header Scroll state (.scrolled class toggle)
    const header = document.querySelector('.header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // 3. Mobile Navigation Toggle (.mobile-open class on .nav)
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navElement = document.querySelector('.nav');
    if (mobileToggle && navElement) {
      mobileToggle.addEventListener('click', () => {
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !expanded);
        navElement.classList.toggle('mobile-open');
      });
    }

    // 5. Table of Contents (TOC) Scrollspy Link tracking
    const tocAside = document.getElementById('toc-aside');
    if (tocAside) {
      const links = tocAside.querySelectorAll('.toc-link');
      links.forEach(link => {
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        ScrollTrigger.create({
          trigger: targetSection,
          start: 'top 30%',
          end: 'bottom 30%',
          onToggle: (self) => {
            if (self.isActive) {
              links.forEach(l => l.classList.toggle('active', l === link));
            }
          }
        });

        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.lenis.scrollTo(targetSection, { offset: -80, duration: 1.2 });
        });
      });
    }

    // 6. Interactive Horizontal Timeline dot clicking
    const timelineWrapper = document.getElementById('prototype-timeline');
    if (timelineWrapper) {
      const dots = timelineWrapper.querySelectorAll('.timeline-dot');
      const cards = timelineWrapper.querySelectorAll('.timeline-node-card');
      const progressLine = document.getElementById('timeline-progress-indicator');

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          const step = dot.getAttribute('data-step');
          
          dots.forEach(d => d.classList.toggle('active', d === dot));
          
          cards.forEach(c => {
            const isActive = c.getAttribute('id') === `timeline-step-${step}`;
            c.classList.toggle('active', isActive);
            if (isActive) {
              gsap.fromTo(c, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
            }
          });

          if (progressLine && dots.length > 1) {
            const percent = (index / (dots.length - 1)) * 100;
            gsap.to(progressLine, { width: `${percent}%`, duration: 0.3, ease: 'power2.out' });
          }
        });
      });
    }

    // 7. Accordion custom GSAP slide transitions for FAQs
    const detailsTags = document.querySelectorAll('.faq-item');
    detailsTags.forEach(details => {
      const summary = details.querySelector('summary');
      const content = details.querySelector('.faq-content');
      const inner = details.querySelector('.faq-content-inner');

      if (!summary || !content || !inner) return;

      let isAnimating = false;
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAnimating) return;
        isAnimating = true;

        if (!details.open) {
          details.open = true;
          gsap.fromTo(content, 
            { height: 0, opacity: 0 },
            { 
              height: inner.offsetHeight, 
              opacity: 1, 
              duration: 0.4, 
              ease: 'power2.out',
              onComplete: () => {
                content.style.height = 'auto';
                isAnimating = false;
              }
            }
          );
        } else {
          gsap.fromTo(content, 
            { height: content.offsetHeight, opacity: 1 },
            { 
              height: 0, 
              opacity: 0, 
              duration: 0.35, 
              ease: 'power2.inOut',
              onComplete: () => {
                details.open = false;
                isAnimating = false;
              }
            }
          );
        }
      });
    });

    // 8. Stats counter rolling on scroll
    const statsElements = document.querySelectorAll('.counter-number');
    statsElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const counter = { value: 0 };
      
      gsap.to(counter, {
        value: target,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          el.textContent = Math.floor(counter.value);
        },
        onComplete: () => {
          el.textContent = target;
        }
      });
    });

    // 9. Dynamic local reading progress bar
    const localProgress = document.getElementById('local-progress-bar');
    if (localProgress) {
      gsap.to(localProgress, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
    }

    // Render dynamic credentials content and setup tables if present
    this.renderDynamicContent();
    this.setupProjectTable();
  }

  initCustomCursor() {
    const cursorOuter = document.getElementById('cursor-outer');
    const cursorInner = document.getElementById('cursor-inner');

    if (cursorOuter && cursorInner && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', (e) => {
        gsap.to(cursorOuter, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
        gsap.to(cursorInner, { x: e.clientX, y: e.clientY, duration: 0.02 });
      });

      const bindHoverStates = () => {
        const interactables = document.querySelectorAll('a, button, .timeline-dot, summary, .toc-link');
        interactables.forEach(item => {
          if (item.dataset.cursorBound) return;
          item.dataset.cursorBound = 'true';

          item.addEventListener('mouseenter', () => {
            cursorOuter.classList.add('cursor-hover');
            cursorInner.classList.add('cursor-hover');
          });
          item.addEventListener('mouseleave', () => {
            cursorOuter.classList.remove('cursor-hover');
            cursorInner.classList.remove('cursor-hover');
          });
        });
      };

      bindHoverStates();

      // Hook renderComplete triggers to re-bind hover states on dynamic content
      EventBus.on('ui:renderComplete', () => {
        bindHoverStates();
      });

      // Quick timeouts to bind late-initialized elements
      setTimeout(bindHoverStates, 1000);
      setTimeout(bindHoverStates, 3000);
    }
  }

  setupCapabilitiesPageAnimations() {
    if (!this.sceneManager || !this.sceneManager.camera) return;

    // Load capabilities models immediately
    this.sceneManager.handleSectionTransition('capabilities');

    // Fade out canvas in the software stack section
    const canvas = document.getElementById('webgl-canvas');
    const softwareSec = document.querySelector('.software-grid');
    if (canvas && softwareSec) {
      gsap.to(canvas, {
        opacity: 0,
        scrollTrigger: {
          trigger: softwareSec,
          start: 'top bottom',
          end: 'top center',
          scrub: true
        }
      });
    }
  }
}

// Instantiate App
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
