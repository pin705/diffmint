import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
      '@diffmint/contracts': path.resolve(__dirname, 'packages/contracts/src/index.ts'),
      '@diffmint/docs-content': path.resolve(__dirname, 'packages/docs-content/src/index.ts'),
      '@diffmint/policy-engine': path.resolve(__dirname, 'packages/policy-engine/src/index.ts'),
      '@diffmint/review-core': path.resolve(__dirname, 'packages/review-core/src/index.ts')
    }
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: true,
    restoreMocks: true,
    passWithNoTests: false
  }
});
