import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/approval-dashboard/',
  plugins: [react()]
});
