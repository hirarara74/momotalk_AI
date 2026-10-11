import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  // Absolute URL for og:image / twitter:image (crawlers ignore relative paths); the free edition overrides it in .env.free
  const siteUrl = (loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://hirarara74.github.io/momotalk_AI').replace(/\/$/, '')
  const base = process.env.VITE_BASE || (isDev ? '/momotalk/' : '/momotalk_AI/')

  return {
    plugins: [
      { name: 'site-url', transformIndexHtml: (html: string) => html.replaceAll('__SITE_URL__', siteUrl) },
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
      host: true
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