import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function getHtmlInputs() {
  const inputs = {
    main: resolve(__dirname, 'index.html'),
  };

  const teamDir = resolve(__dirname, 'team');
  if (fs.existsSync(teamDir)) {
    const folders = fs.readdirSync(teamDir);
    folders.forEach(folder => {
      const folderPath = resolve(teamDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const htmlFile = resolve(folderPath, 'index.html');
        if (fs.existsSync(htmlFile)) {
          inputs[`team_${folder}`] = htmlFile;
        }
      }
    });
    const teamIndex = resolve(teamDir, 'index.html');
    if (fs.existsSync(teamIndex)) {
      inputs['team_index'] = teamIndex;
    }
  }
  return inputs;
}

export default defineConfig({
  root: resolve(__dirname),
  base: process.env.NODE_ENV === 'production' ? '/enconsta-engineering/' : '/',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlInputs(),
    },
  },
});
