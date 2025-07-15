import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/esercente/', // <-- importante per il deploy su un path
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

