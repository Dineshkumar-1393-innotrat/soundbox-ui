import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api/hardware$': {
        target: 'https://hardware-api-calls.onrender.com',
        changeOrigin: true,
        rewrite: (path) => '/api/gethardware-data'
      },
      '^/api/hardware-test-result$': {
        target: 'https://hardware-api-calls.onrender.com',
        changeOrigin: true,
        rewrite: (path) => '/api/hardware-test-result'
      }
    }
  }
});
