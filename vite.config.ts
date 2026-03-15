import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const examApiTarget = (env.VITE_EXAM_API_BASE || 'https://exam-api.teachera.com.tr').trim();
  const panelApiTarget = (env.VITE_PANEL_API_BASE || 'https://panel-api.teachera.com.tr').trim();
  const opsApiTarget = (env.VITE_OPS_API_BASE || 'https://ops-api.teachera.com.tr').trim();

  const examApiOrigin = (() => {
    try {
      return new URL(examApiTarget).origin;
    } catch {
      return 'https://exam-api.teachera.com.tr';
    }
  })();

  const panelApiOrigin = (() => {
    try {
      return new URL(panelApiTarget).origin;
    } catch {
      return 'https://panel-api.teachera.com.tr';
    }
  })();

  const opsApiOrigin = (() => {
    try {
      return new URL(opsApiTarget).origin;
    } catch {
      return 'https://ops-api.teachera.com.tr';
    }
  })();

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
        // Map Figma Make asset imports to local exported assets
        'figma:asset': path.resolve(__dirname, './src/assets'),
      },
    },

    server: {
      proxy: {
        '/api/panel': {
          target: panelApiTarget,
          changeOrigin: true,
          secure: true,
          headers: {
            origin: panelApiOrigin,
          },
        },
        '/api/ops': {
          target: opsApiTarget,
          changeOrigin: true,
          secure: true,
          headers: {
            origin: opsApiOrigin,
          },
        },
        '/api': {
          target: examApiTarget,
          changeOrigin: true,
          secure: true,
          headers: {
            origin: examApiOrigin,
          },
        },
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion-vendor';
            if (id.includes('@radix-ui')) return 'radix-vendor';
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui-vendor';
            if (id.includes('react-router')) return 'router-vendor';
            return 'vendor';
          },
        },
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  };
})
