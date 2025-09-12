import { defineConfig, mergeConfig } from 'vite';
import { coverageConfigDefaults, defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const viteConfig = defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  base: '/esercente/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    deps: {
      inline: [
        '@mui/x-data-grid'
      ]
    },
    coverage: {
      provider: 'v8',
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ['text', 'json-summary', 'json'],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80
      },
      exclude: ['**/openApi/**', '**/src/config/**', '**/src/utils/constants.ts',
        '**/src/api/generated/**', ...coverageConfigDefaults.exclude]
    }
  },
});

export default mergeConfig(viteConfig, vitestConfig);
