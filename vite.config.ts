import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { seo } from './plugins/seo'

/**
 * GitHub Pages serves this project from /<repo>/, so the base path is set at
 * build time. `npm run dev` and any other host still use "/".
 */
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? process.env.BASE_PATH || '/' : '/',
  plugins: [react(), seo()],
  server: { port: 5173, open: true },
  build: { target: 'es2020' },
}))
