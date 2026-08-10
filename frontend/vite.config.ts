import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (!normalizedId.includes('/node_modules/')) return undefined;

            const hasPackage = (pkg: string) =>
              normalizedId.includes(`/node_modules/${pkg}/`) ||
              normalizedId.includes(`/node_modules/.pnpm/${pkg.replace('/', '+')}@`);
            const hasPackagePrefix = (pkgPrefix: string) =>
              normalizedId.includes(`/node_modules/${pkgPrefix}`) ||
              normalizedId.includes(`/node_modules/.pnpm/${pkgPrefix.replace('/', '+')}`);

            if (
              hasPackage('react') ||
              hasPackage('react-dom') ||
              hasPackage('scheduler') ||
              hasPackage('react-router-dom') ||
              hasPackagePrefix('@remix-run+')
            ) {
              return 'react-vendor';
            }
            if (hasPackage('firebase') || hasPackagePrefix('@firebase+')) return 'firebase';
            if (hasPackage('recharts') || hasPackagePrefix('d3-')) return 'charts';
            if (hasPackage('leaflet') || hasPackage('react-leaflet')) return 'maps';
            if (hasPackage('jspdf') || hasPackage('jspdf-autotable') || hasPackage('xlsx')) return 'documents';
            if (hasPackage('motion') || hasPackage('framer-motion')) return 'motion';
            if (
              hasPackage('i18next') ||
              hasPackage('react-i18next') ||
              hasPackage('i18next-browser-languagedetector') ||
              hasPackage('i18next-http-backend') ||
              hasPackagePrefix('@fontsource-variable+')
            ) {
              return 'app-foundation';
            }
            if (hasPackage('lucide-react')) return 'icons';
            if (
              hasPackagePrefix('@base-ui+') ||
              hasPackage('sonner') ||
              hasPackage('react-hook-form') ||
              hasPackage('@hookform/resolvers') ||
              hasPackage('zod')
            ) {
              return 'ui-vendor';
            }
            return undefined;
          },
        },
      },
    },
    server: {
      port: 5000,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3001',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
