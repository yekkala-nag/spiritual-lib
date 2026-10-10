import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

function inspectPlugin(isDev: boolean): Plugin[] {
  if (!isDev) return []
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { inspectAttr } = require('kimi-plugin-inspect-react')
    return inspectAttr ? [inspectAttr()] : []
  } catch {
    return []
  }
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    base: './',
    plugins: [
      react(),
      ...inspectPlugin(isDev),
    ],
    server: {
      port: 3000,
      host: true,
    },
    preview: {
      port: 3000,
      host: true,
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router/')) {
                return 'vendor-react'
              }
              if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul')) {
                return 'vendor-ui'
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons'
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase'
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
