import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Static deploy. For GitHub Pages under a sub-path, set base: '/chorder-almanac/'.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
