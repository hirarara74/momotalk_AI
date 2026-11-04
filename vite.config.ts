import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  const isDebug = isDev && mode === 'debug'
  const debugKey = isDebug ? loadEnv(mode, process.cwd(), 'GROQ_DEBUG_').GROQ_DEBUG_API_KEY?.trim() : ''
  if (isDebug && !/^gsk_[A-Za-z0-9]+$/.test(debugKey || '')) {
    throw new Error('Set GROQ_DEBUG_API_KEY in .env.debug.local before starting dev:debug')
  }
  // Absolute URL for og:image / twitter:image (crawlers ignore relative paths); the free edition overrides it in .env.free
  const siteUrl = (loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://hirarara74.github.io/momotalk_AI').replace(/\/$/, '')
  // Cloudflare Web Analytics site token (public by design; it is visible in the served HTML). The free edition overrides it in .env.free.
  // Two sites, one per edition: this default = hirarara74.github.io, .env.free = *.workers.dev. `node scripts/cf-analytics.mjs` splits the numbers by host.
  const beaconToken = loadEnv(mode, process.cwd(), 'VITE_').VITE_CF_BEACON_TOKEN || 'be3702350e794c55a6a5d483400495e7'
  const base = process.env.VITE_BASE || (isDev ? '/momotalk/' : '/momotalk_AI/')

  return {
    plugins: [
      {
        name: 'debug-groq-boundary',
        configureServer: (server) => {
          if (!isDebug) return
          server.middlewares.use((request, response, next) => {
            if (request.url === `${base}api/debug-groq/chat/completions` &&
                (request.method !== 'POST' || !request.headers['content-type']?.startsWith('application/json') ||
                 (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`))) {
              response.statusCode = 403
              response.end('Forbidden')
              return
            }
            next()
          })
        }
      },
      {
        name: 'site-url',
        transformIndexHtml: (html: string) => {
          const withUrl = html.replaceAll('__SITE_URL__', siteUrl)
          // No analytics beacon while developing locally
          if (isDev) return withUrl.replace(/<!-- cf-beacon -->[\s\S]*?<!-- \/cf-beacon -->/, '')
          return withUrl.replaceAll('__CF_BEACON_TOKEN__', beaconToken)
        }
      },
      vue(),
      vueJsx(),
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: "__tla",
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: i => `__tla_${i}`
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    base,
    build: {
      outDir: 'dist',
      emptyOutDir: true
    },
    server: {
      port: 5174,
      host: isDebug ? '127.0.0.1' : true,
      cors: isDebug ? false : undefined,
      proxy: isDebug ? {
        [`^${base}api/debug-groq/chat/completions$`]: {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: () => '/openai/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (request) => {
              // Replace any saved/browser key; only the server owns the debug credential.
              request.setHeader('Authorization', `Bearer ${debugKey}`)
            })
          }
        }
      } : undefined
    },
    css: {
      // css预处理器
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/css/mixin.scss";'
        }
      },
    }
  }
})