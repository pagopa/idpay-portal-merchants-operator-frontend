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
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material\/esm\/(.*)$/,
        replacement: '@mui/icons-material/$1',
      },
      {
        find: /^@mui\/material\/esm\/(.*)$/,
        replacement: '@mui/material/$1',
      },
      {
        find: /^@mui\/utils\/formatMuiErrorMessage$/,
        replacement: '@mui/utils/formatMuiErrorMessage',
      },
    ],
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    deps: {
      inline: ['@mui/x-data-grid'],
    },
    css: true,
    alias: [
      {
        find: '@pagopa/mui-italia/components',
        replacement:
          'D:/PagoPa/idpay-portal-merchants-operator-frontend/node_modules/@pagopa/mui-italia/components/index.js',
      },
      {
        find: /^@mui\/icons-material\/esm\/(.*)$/,
        replacement: '@mui/icons-material/$1',
      },
      {
        find: /^@mui\/utils\/formatMuiErrorMessage$/,
        replacement: '@mui/utils/formatMuiErrorMessage',
      },
    ],
    server: {
      deps: {
        inline: [
          '@pagopa/mui-italia',
          '@mui/material',
          '@mui/x-data-grid',
          '@mui/icons-material',
          '@emotion/react',
          '@emotion/styled',
          '@pagopa/selfcare-common-frontend',
        ],
      },
    },
    coverage: {
      provider: 'v8',
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ['text', 'json-summary', 'json', 'lcov'],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      exclude: [
        '**/openApi/**',
        '**/src/contexts/**',
        '**/src/api/generated/**',
        '**/src/routes.ts',
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});

export default mergeConfig(viteConfig, vitestConfig);
