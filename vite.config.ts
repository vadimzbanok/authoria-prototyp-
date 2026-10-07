import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // The workshop folder name intentionally contains a colon. Permit it as Vite's root in dev mode.
    fs: { strict: false },
  },
})
