import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': '/src', // Example alias configuration
//     },
//   },
//   server: {
//     port: 3000, // Customize dev server port
//   },
//   build: {
//     outDir: 'build', // Customize output directory
//   },
// });
