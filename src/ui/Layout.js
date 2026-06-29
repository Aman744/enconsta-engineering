export class Layout {
  constructor() {
    this.init();
  }

  init() {
    // 1. Calculate relative path depth dynamically
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && s !== 'index.html');
    
    // Ignore GitHub Pages project subfolder name if present
    if (segments[0] === 'enconsta-engineering') {
      segments.shift();
    }
    
    const depth = segments.length;
    const relativePath = '../'.repeat(depth) || './';

    // 2. Detect active link
    let activeLink = '';
    if (path.includes('/services/')) {
      activeLink = 'services';
    } else if (path.includes('/capabilities/')) {
      activeLink = 'capabilities';
    } else if (path.includes('/credentials/')) {
      activeLink = 'credentials';
    } else if (path.includes('/contact/')) {
      activeLink = 'contact';
    } else if (segments.length === 0) {
      activeLink = 'home';
    }

    // 3. Inject/overwrite Header Navigation
    let header = document.querySelector('header.header');
    if (!header) {
      header = document.createElement('header');
      header.className = 'header';
      document.body.insertBefore(header, document.body.firstChild);
    }
    header.innerHTML = this.getHeaderHtml(relativePath, activeLink);

    // 4. Inject/overwrite Footer
    let footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer');
      document.body.appendChild(footer);
    }
    footer.className = 'footer-simple bg-dark text-light border-top';
    footer.innerHTML = this.getFooterHtml(relativePath);
  }

  getHeaderHtml(relativePath, activeLink) {
    return `
      <div class="nav-container">
        <a href="${relativePath}" class="logo" id="nav-logo">
          <img src="${relativePath}images/logo.png" alt="Enconsta Logo" class="logo-img">
        </a>
        <nav class="nav" aria-label="Main Navigation">
          <a href="${relativePath}" class="nav-link ${activeLink === 'home' ? 'active' : ''}">Home</a>
          <a href="${relativePath}#about" class="nav-link">About</a>
          <div class="nav-dropdown-wrapper">
            <a href="${relativePath}services/" class="nav-link ${activeLink === 'services' ? 'active' : ''} dropdown-toggle">
              Services <span class="arrow">&#9662;</span>
            </a>
            <div class="dropdown-menu">
              <a href="${relativePath}services/engineering/">Engineering</a>
              <a href="${relativePath}services/supply-chain/">Supply Chain</a>
              <a href="${relativePath}services/construction/">Construction</a>
              <a href="${relativePath}services/completions/">Completions</a>
              <a href="${relativePath}services/project-management/">Project Management</a>
              <a href="${relativePath}services/manpower-consulting/">Manpower Consulting</a>
            </div>
          </div>
          <a href="${relativePath}capabilities/" class="nav-link ${activeLink === 'capabilities' ? 'active' : ''}">Capabilities</a>
          <a href="${relativePath}credentials/" class="nav-link ${activeLink === 'credentials' ? 'active' : ''}">Credentials</a>
          <a href="${relativePath}contact/" class="btn-expert ${activeLink === 'contact' ? 'active' : ''}">Talk to Experts</a>
        </nav>
        <button class="mobile-nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    `;
  }

  getFooterHtml(relativePath) {
    return `
      <div class="container grid-3 footer-grid">
        <div class="footer-info-col">
          <div class="footer-logo">
            <img src="${relativePath}images/logo.png" alt="Enconsta Logo" class="footer-logo-img">
          </div>
          <p class="opacity-70">Providing high-precision engineering design, detailing, and commissioning solutions globally.</p>
        </div>
        <div class="footer-links-col">
          <h4>Navigation</h4>
          <a href="${relativePath}">Home</a>
          <a href="${relativePath}#about">About Us</a>
          <a href="${relativePath}services/">Our Services</a>
          <a href="${relativePath}capabilities/">Capabilities</a>
          <a href="${relativePath}credentials/">Credentials</a>
          <a href="${relativePath}contact/">Inquire Support</a>
        </div>
        <div class="footer-address-col">
          <h4>Office Locations</h4>
          <p class="opacity-80" style="line-height: 1.6; font-size: 0.95rem;">
            Dubai &bull; Chennai &bull; Hyderabad &bull; Bengaluru &bull; Visakhapatnam
          </p>
          <p class="opacity-70" style="margin-top: 10px;">Email: info@enconsta.com</p>
        </div>
      </div>
      <div class="footer-bottom text-center">
        <p>&copy; 2026 Enconsta Consulting Pvt. Ltd. GSTN: 36AAICE4997P1ZM. All rights reserved.</p>
      </div>
    `;
  }
}

export default Layout;
