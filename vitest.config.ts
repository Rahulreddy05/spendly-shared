import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/types/**'],
      reporter: ['text-summary', 'text'],
      // Do not lower these. This package is used by every Spendly app.
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 },
    },
  },
});
