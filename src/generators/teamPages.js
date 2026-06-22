import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executives } from '../content/executives.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../');
const teamDir = path.join(rootDir, 'team');

// Ensure base team directory exists
if (!fs.existsSync(teamDir)) {
  fs.mkdirSync(teamDir, { recursive: true });
}

// Template for the Executive Profile page
function generateProfileHtml(exec) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": exec.name,
    "jobTitle": exec.designation,
    "worksFor": {
      "@type": "Organization",
      "name": "Enconsta Consulting Pvt Ltd",
      "url": "https://enconsta.com"
    },
    "description": exec.bio,
    "sameAs": [exec.linkedin],
    "email": exec.email
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${exec.name} - ${exec.designation} | Enconsta Consulting</title>
  <meta name="description" content="Meet ${exec.name}, ${exec.designation} at Enconsta Consulting. Learn about their engineering expertise, leadership experience, and background.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/style.css">
  <script type="application/ld+json">
    ${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body class="bg-dark text-light typography-outfit">
  <div class="blueprint-overlay opacity-05"></div>

  <header class="header">
    <div class="nav-container">
      <a href="/" class="logo">
        <span class="logo-symbol">//</span> Enconsta
      </a>
      <nav class="nav">
        <a href="/" class="nav-link">Home</a>
        <a href="/#services" class="nav-link">Services</a>
        <a href="/#capabilities" class="nav-link">Capabilities</a>
        <a href="/#team" class="nav-link active">Team</a>
        <a href="/#contact" class="btn-expert">Talk to Experts</a>
      </nav>
    </div>
  </header>

  <main class="profile-main">
    <div class="profile-container">
      <a href="/#team" class="back-link">&larr; Back to Executive Directory</a>
      
      <div class="profile-grid">
        <div class="profile-visual">
          <div class="profile-portrait-placeholder">
            <span>${exec.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div class="profile-meta-info">
            <span class="meta-label">Hierarchical Rank</span>
            <span class="meta-value">${exec.hierarchy}</span>
          </div>
        </div>

        <div class="profile-content">
          <span class="profile-pretitle">Enconsta Leadership</span>
          <h1 class="profile-name">${exec.name}</h1>
          <h2 class="profile-title">${exec.designation}</h2>

          <div class="profile-divider"></div>

          <div class="profile-section">
            <h3>Biography</h3>
            <p>${exec.bio}</p>
          </div>

          <div class="profile-section">
            <h3>Key Expertise</h3>
            <ul class="expertise-tags">
              ${exec.expertise.map(exp => `<li>${exp}</li>`).join('\n              ')}
            </ul>
          </div>

          <div class="profile-section">
            <h3>Professional Experience</h3>
            <p>${exec.experience}</p>
          </div>

          <div class="profile-actions">
            <a href="${exec.linkedin}" target="_blank" rel="noopener noreferrer" class="btn-profile-action linkedin-btn">LinkedIn Profile</a>
            <a href="/#contact" class="btn-profile-action contact-btn">Inquire Consultation</a>
            <a href="/" class="btn-profile-action download-btn">Download Profile</a>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer class="footer-simple">
    <p>&copy; 2026 Enconsta Consulting Pvt. Ltd. All rights reserved.</p>
  </footer>

  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// Generate subpages
executives.forEach(exec => {
  const pageSlug = exec.slug;
  const execDir = path.join(teamDir, pageSlug);

  if (!fs.existsSync(execDir)) {
    fs.mkdirSync(execDir, { recursive: true });
  }

  const htmlContent = generateProfileHtml(exec);
  fs.writeFileSync(path.join(execDir, 'index.html'), htmlContent, 'utf-8');
  console.log(`[teamPages Generator] Created /team/${pageSlug}/index.html`);
});

// Also create an index.html for /team/ showing all executives
function generateTeamIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Directory | Enconsta Consulting</title>
  <meta name="description" content="Meet the leadership team at Enconsta Consulting Pvt Ltd. Industry experts directing EPC and engineering operations.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/style.css">
</head>
<body class="bg-dark text-light typography-outfit">
  <div class="blueprint-overlay opacity-05"></div>

  <header class="header">
    <div class="nav-container">
      <a href="/" class="logo"><span class="logo-symbol">//</span> Enconsta</a>
      <nav class="nav">
        <a href="/" class="nav-link">Home</a>
        <a href="/#services" class="nav-link">Services</a>
        <a href="/#capabilities" class="nav-link">Capabilities</a>
        <a href="/#team" class="nav-link active">Team</a>
        <a href="/#contact" class="btn-expert">Talk to Experts</a>
      </nav>
    </div>
  </header>

  <main class="profile-main">
    <div class="profile-container text-center">
      <h1 class="profile-name">Executive Directory</h1>
      <p class="profile-pretitle">The experienced professionals steering global EPC operations.</p>
      
      <div class="directory-list">
        ${executives.map(exec => `
          <div class="directory-card">
            <h3>${exec.name}</h3>
            <p class="meta-label">${exec.designation}</p>
            <a href="/team/${exec.slug}/" class="btn-link">View Profile &rarr;</a>
          </div>
        `).join('')}
      </div>
    </div>
  </main>

  <footer class="footer-simple">
    <p>&copy; 2026 Enconsta Consulting Pvt. Ltd. All rights reserved.</p>
  </footer>

  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

fs.writeFileSync(path.join(teamDir, 'index.html'), generateTeamIndexHtml(), 'utf-8');
console.log(`[teamPages Generator] Created /team/index.html`);
