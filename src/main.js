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

    // Initialize observability logs
    monitoringService.init();
    performanceService.startTracking();

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
  }

  renderDynamicContent() {
    // 1. Render Services
    const servicesTarget = document.getElementById('services-target');
    if (servicesTarget) {
      servicesTarget.innerHTML = services.map(s => `
        <div class="service-card" id="service-${s.id}">
          <span class="service-icon">//</span>
          <h3 class="service-title">${s.title}</h3>
          <p class="service-subtitle">${s.subtitle}</p>
          <ul class="service-bullets">
            ${s.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }

    // 2. Render Global Operations Offices
    const officesTarget = document.getElementById('offices-target');
    if (officesTarget) {
      officesTarget.innerHTML = offices.map(o => `
        <div class="office-info-card">
          <h4>${o.name} ${o.isHQ ? `<span class="hq-badge">Global HQ</span>` : ''}</h4>
          <span class="office-region">${o.region}</span>
          <p class="office-address">${o.address}</p>
          <span class="office-phone">Tel: ${o.phone}</span>
          <span class="office-email">Email: ${o.email}</span>
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

    // 2. Capabilities Horizontal Scroll pinning
    const panels = gsap.utils.toArray('.panel');
    const pin = gsap.to('.horizontal-scroll-container', {
      xPercent: -75, // Translate through 4 panels (each 100vw, so xPercent is -75)
      ease: 'none',
      scrollTrigger: {
        trigger: '#capabilities-pin',
        pin: true,
        start: 'top top',
        end: '+=300%',
        scrub: 1,
        onUpdate: (self) => {
          // Travel camera dynamically through X positions based on horizontal scroll progress
          // Offset the camera position depending on viewport layout to prevent overlapping HTML text
          if (this.sceneManager && this.sceneManager.camera) {
            const isDesktop = window.innerWidth > 1024;
            const xOffset = isDesktop ? -12 : 0;
            const yOffset = isDesktop ? 0 : 8; // Shift camera up on mobile to push model to the bottom half

            const camX = gsap.utils.interpolate(-90, 90, self.progress) + xOffset;

            this.sceneManager.camera.position.x = camX;
            this.sceneManager.camera.position.y = yOffset;
          }
        },
        onLeave: () => {
          if (this.sceneManager && this.sceneManager.camera) {
            gsap.to(this.sceneManager.camera.position, {
              x: 0,
              y: 0,
              duration: 0.8,
              overwrite: 'auto'
            });
          }
        },
        onLeaveBack: () => {
          if (this.sceneManager && this.sceneManager.camera) {
            gsap.to(this.sceneManager.camera.position, {
              x: 0,
              y: 0,
              duration: 0.8,
              overwrite: 'auto'
            });
          }
        }
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
}

// Instantiate App
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
