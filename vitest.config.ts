import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/msw/setupTests.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
