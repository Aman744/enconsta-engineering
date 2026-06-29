import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  base: process.env.NODE_ENV === 'production' ? '/enconsta-engineering/' : '/',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services/index.html'),
        engineering: resolve(__dirname, 'services/engineering/index.html'),
        'supply-chain': resolve(__dirname, 'services/supply-chain/index.html'),
        construction: resolve(__dirname, 'services/construction/index.html'),
        completions: resolve(__dirname, 'services/completions/index.html'),
        'project-management': resolve(__dirname, 'services/project-management/index.html'),
        'manpower-consulting': resolve(__dirname, 'services/manpower-consulting/index.html'),
        capabilities: resolve(__dirname, 'capabilities/index.html'),
        credentials: resolve(__dirname, 'credentials/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      },
    },
  },
});
