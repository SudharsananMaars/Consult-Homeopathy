import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,  // You can specify a different port here
  },

  css: {
    postcss: {
      plugins: [tailwindcss('./tailwind.config.cjs')]
    }
  }
});
