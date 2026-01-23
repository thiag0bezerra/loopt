import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 30000, // Timeout maior para testes de integração com RabbitMQ
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
