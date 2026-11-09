import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from a repository sub-path.
export default defineConfig({
  plugins: [react()],
  base: '/BSG-OYMS-40-KV-OF-MEDAK/'
});
