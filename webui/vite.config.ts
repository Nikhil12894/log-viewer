// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/cem/bff/log-viewer/quinoa', // 👈 important
  plugins: [react()],
  server: {
    // this ensures that the browser opens upon server start
        open: true,
    // host: '0.0.0.0',        // 👈 Required for Docker/WSL2
    port: 5173,         // 👈 Port for Vite dev server
    // strictPort: true,
    // watch: {
    //   usePolling: true      // 👈 Helps with file watching issues in WSL2
    // },
    proxy: {
      '/cem/bff/log-viewer/api': {
        target: 'http://localhost:8080', // Quarkus backend 'http://host.docker.internal:8080',//
        changeOrigin: true,
        secure: false,
      },
    },
  }
});
