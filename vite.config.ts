import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages usa o nome do repo como base
  // Para repo "b3-tracker" a URL será: https://username.github.io/b3-tracker/
  // Se o repo for username.github.io, deixe base: '/'
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
