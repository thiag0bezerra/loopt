import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

/**
 * Configuração específica para testes de integração.
 *
 * Requer que os serviços externos estejam rodando:
 * - PostgreSQL (porta 5432)
 * - Redis (porta 6379)
 * - RabbitMQ (porta 5672)
 *
 * Execute: docker compose up -d
 * Depois: pnpm test:integration
 */
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.integration.spec.ts'],
    testTimeout: 30000, // Timeout maior para conexões com serviços externos
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
