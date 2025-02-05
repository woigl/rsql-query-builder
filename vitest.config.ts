import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8', // Use 'istanbul' if needed
      reporter: ['text', 'lcov'], // Ensure 'lcov' is here
      reportsDirectory: './coverage',
    },
  },
});