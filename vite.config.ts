import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const index = path.resolve(__dirname, 'dist/index.html');
      const fallback = path.resolve(__dirname, 'dist/404.html');
      if (existsSync(index)) {
        copyFileSync(index, fallback);
      }
    },
  };
}

export default defineConfig({
  base: '/tech-calendar/',
  plugins: [react(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
