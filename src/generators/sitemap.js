import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    { loc: '/', priority: '1.0', changefreq: 'weekly' }
  ];

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
