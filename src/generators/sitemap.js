import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executives } from '../content/executives.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../');
const sitemapPath = path.join(rootDir, 'public/sitemap.xml');

// Ensure public directory exists
const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function generateSitemap() {
  const baseUrl = 'https://enconsta.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/team/', priority: '0.8', changefreq: 'monthly' }
  ];

  executives.forEach(exec => {
    urls.push({
      loc: `/team/${exec.slug}/`,
      priority: '0.7',
      changefreq: 'monthly'
    });
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  urls.forEach(item => {
    xml += `
  <url>
    <loc>${baseUrl}${item.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`[sitemap Generator] Created public/sitemap.xml`);
}

generateSitemap();
