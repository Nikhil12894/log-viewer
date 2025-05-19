// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/cem/bff/log-viewer/', // 👈 important
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // 👈 Required for Docker/WSL2
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true      // 👈 Helps with file watching issues in WSL2
    },
    proxy: {
      '/cem/bff/log-viewer/api': {
        target: 'http://host.docker.internal:8080',//'http://localhost:8080/cem/bff/log-viewer', // Quarkus backend
        changeOrigin: true,
        secure: false,
      },
    },
  }
});
