import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Kept separate from vite.config.ts so the SEO plugin — which emits files and
 * expects a real build — never runs during a test.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    restoreMocks: true,
  },
})
