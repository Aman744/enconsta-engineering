import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { services } from '../content/services.js';
import { offices } from '../content/offices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../');
const schemaPath = path.join(rootDir, 'public/schemas-org.json');

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function generateSchemas() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Enconsta Consulting Pvt Ltd",
    "url": "https://enconsta.com",
    "logo": "https://enconsta.com/logo.png",
    "description": "Multidisciplinary Engineering, Construction, Project Management, Operations & Maintenance Solutions for Oil & Gas, Power, and Industrial Infrastructure.",
    "founder": "Seasoned Industry Professionals",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Chennai",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "India"
    }
  };

  const businessSchema = offices.map(office => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Enconsta Consulting - ${office.name}`,
    "description": office.region,
    "telephone": office.phone,
    "email": office.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": office.address,
      "addressCountry": office.id === 'dubai' ? 'UAE' : 'India'
    }
  }));

  const serviceSchema = services.map(srv => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": srv.title,
    "provider": {
      "@type": "Organization",
      "name": "Enconsta Consulting Pvt Ltd"
    },
    "description": srv.subtitle
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What engineering sectors does Enconsta serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Enconsta serves Oil & Gas, Petrochemical, Refinery, Power Plant, Solar, Wind Energy, and Industrial Infrastructure sectors globally."
        }
      },
      {
        "@type": "Question",
        "name": "What are Enconsta's core capabilities?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our core capabilities are divided into four main groupings: Engineering (Process, Mechanical, HSE), Infrastructure (Civil & Piping), Systems (Electrical & Instrumentation), and Digital (AI-enabled workflows & software integration)."
        }
      }
    ]
  };

  const combined = {
    organization: orgSchema,
    offices: businessSchema,
    services: serviceSchema,
    faq: faqSchema
  };

  fs.writeFileSync(schemaPath, JSON.stringify(combined, null, 2), 'utf-8');
  console.log(`[schema Generator] Created public/schemas-org.json`);
}

generateSchemas();
