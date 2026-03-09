import { existsSync } from 'node:fs'
import path from 'path'
import { pathToFileURL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

type DevApiRequest = {
  url?: string
  query?: Record<string, string>
  body?: unknown
  on: (event: string, listener: (...args: unknown[]) => void) => void
  headers: Record<string, string | string[] | undefined>
  method?: string
}

type DevApiResponse = {
  writableEnded?: boolean
  statusCode?: number
  setHeader: (name: string, value: string) => void
  end: (body?: string) => void
  status?: (code: number) => DevApiResponse
}

function burslulukApiDevPlugin(): Plugin {
  return {
    name: 'bursluluk-api-dev-runtime',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const request = req as DevApiRequest
        const response = res as DevApiResponse
        const currentUrl = request.url ? new URL(request.url, 'http://127.0.0.1') : null

        if (!currentUrl || !currentUrl.pathname.startsWith('/api/')) {
          next()
          return
        }

        const handlerPath = path.resolve(__dirname, `.${currentUrl.pathname}.js`)
        if (!existsSync(handlerPath)) {
          response.statusCode = 404
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: false, error: 'not_found' }))
          return
        }

        request.query = Object.fromEntries(currentUrl.searchParams.entries())
        response.status = (code: number) => {
          response.statusCode = code
          return response
        }

        try {
          const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`
          const imported = await import(moduleUrl)
          const handler = imported?.default

          if (typeof handler !== 'function') {
            throw new Error(`Invalid API handler: ${currentUrl.pathname}`)
          }

          await handler(request, response)
          if (!response.writableEnded) {
            next()
          }
        } catch (error) {
          server.ssrFixStacktrace(error as Error)
          if (response.writableEnded) return
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ ok: false, error: 'dev_api_runtime_failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      burslulukApiDevPlugin(),
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
  }
})
