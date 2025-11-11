import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages uses the repo name as base
  // For repo "b3-tracker" the URL will be: https://username.github.io/b3-tracker/
  // If the repo is username.github.io, leave base: '/'
  base: mode === 'production' ? '/b3-tracker/' : '/',

  server: {
    port: 3000,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
