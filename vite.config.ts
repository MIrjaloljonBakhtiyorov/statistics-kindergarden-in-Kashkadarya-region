import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/admin': {
          target: 'http://127.0.0.1:3003',
          changeOrigin: true,
          ws: true,
          bypass: (req, res) => {
            if (req.url === '/admin') {
              res.writeHead(301, { Location: '/admin/' });
              res.end();
              return false;
            }
            return null;
          }
        },
        '/api': {
          target: 'http://127.0.0.1:3002',
          changeOrigin: true,
          ws: true,
        },
        '/kindergarten-api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/kindergarten-api/, '/api'),
        },
        '/kindergarten': {
          target: 'http://127.0.0.1:3004',
          changeOrigin: true,
          ws: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
