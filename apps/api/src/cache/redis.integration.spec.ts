import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Redis from 'ioredis';

/**
 * Testes de integração para validar a conexão e operações com o Redis.
 *
 * IMPORTANTE: Requer que o Redis esteja rodando (docker compose up redis)
 *
 * Este teste usa ioredis diretamente para validar a conectividade do Redis,
 * independente da camada de cache do NestJS.
 *
 * Executa operações reais para garantir:
 * - Conexão com o Redis
 * - Operações GET/SET/DEL
 * - TTL (Time To Live)
 * - Serialização/deserialização de objetos
 */
describe('Redis Integration Tests', () => {
  let redis: Redis;

  beforeAll(async () => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    redis = new Redis({
      host,
      port,
      keyPrefix: 'loopt-test:',
      lazyConnect: true,
    });

    await redis.connect();
  }, 30000);

  afterAll(async () => {
    if (redis) {
      await redis.quit();
    }
  });

  describe('Redis Connection', () => {
    it('should connect to Redis successfully', async () => {
      const pong = await redis.ping();
      expect(pong).toBe('PONG');
    });

    it('should report Redis server info', async () => {
      const info = await redis.info('server');
      expect(info).toContain('redis_version');
    });
  });

  describe('Basic Operations', () => {
    const baseKey = 'integration-test';

    it('should set and get a string value', async () => {
      const key = `${baseKey}-string-${Date.now()}`;
      const value = 'Hello, Redis!';

      await redis.set(key, value);
      const result = await redis.get(key);

      expect(result).toBe(value);

      // Cleanup
      await redis.del(key);
    });

    it('should set and get a number value', async () => {
      const key = `${baseKey}-number-${Date.now()}`;
      const value = 42;

      await redis.set(key, value.toString());
      const result = await redis.get(key);

      expect(parseInt(result!, 10)).toBe(value);

      // Cleanup
      await redis.del(key);
    });

    it('should set and get a JSON object', async () => {
      const key = `${baseKey}-object-${Date.now()}`;
      const value = {
        id: '123',
        name: 'Test Task',
        status: 'pending',
        tags: ['urgent', 'backend'],
        metadata: {
          priority: 1,
        },
      };

      await redis.set(key, JSON.stringify(value));
      const result = await redis.get(key);

      expect(JSON.parse(result!)).toEqual(value);

      // Cleanup
      await redis.del(key);
    });

    it('should delete a value', async () => {
      const key = `${baseKey}-delete-${Date.now()}`;
      const value = 'to-be-deleted';

      await redis.set(key, value);

      // Verifica que existe
      const beforeDelete = await redis.get(key);
      expect(beforeDelete).toBe(value);

      // Deleta
      await redis.del(key);
      const afterDelete = await redis.get(key);
      expect(afterDelete).toBeNull();
    });

    it('should return null for non-existent key', async () => {
      const key = `${baseKey}-non-existent-${Date.now()}`;
      const result = await redis.get(key);
      expect(result).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should set value with expiration', async () => {
      const key = `ttl-test-${Date.now()}`;
      const value = 'expiring-value';

      // Set com TTL de 2 segundos
      await redis.setex(key, 2, value);

      // Verifica imediatamente
      const beforeExpire = await redis.get(key);
      expect(beforeExpire).toBe(value);

      // Verifica TTL
      const ttl = await redis.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(2);
    });

    it('should expire value after TTL', async () => {
      const key = `ttl-expire-${Date.now()}`;
      const value = 'short-lived';

      // Set com TTL de 1 segundo
      await redis.setex(key, 1, value);

      // Aguarda expirar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verifica que expirou
      const afterExpire = await redis.get(key);
      expect(afterExpire).toBeNull();
    });
  });

  describe('Cache Patterns (Task-specific use cases)', () => {
    it('should cache user tasks list', async () => {
      const userId = 'user-123';
      const key = `tasks:user:${userId}:list`;
      const tasks = [
        { id: 't1', title: 'Task 1', status: 'pending' },
        { id: 't2', title: 'Task 2', status: 'completed' },
      ];

      await redis.set(key, JSON.stringify(tasks));
      const cached = await redis.get(key);

      expect(JSON.parse(cached!)).toEqual(tasks);

      // Cleanup
      await redis.del(key);
    });

    it('should cache single task by id', async () => {
      const taskId = 'task-456';
      const key = `tasks:${taskId}`;
      const task = {
        id: taskId,
        title: 'Cached Task',
        description: 'This task is cached',
        status: 'in_progress',
        priority: 'high',
        userId: 'user-123',
      };

      await redis.set(key, JSON.stringify(task));
      const cached = await redis.get(key);
      const parsed = JSON.parse(cached!);

      expect(parsed).toEqual(task);
      expect(parsed.id).toBe(taskId);

      // Cleanup
      await redis.del(key);
    });

    it('should invalidate multiple related keys', async () => {
      const userId = 'user-789';
      const taskId = 'task-abc';

      const listKey = `tasks:user:${userId}:list`;
      const itemKey = `tasks:${taskId}`;

      await redis.set(listKey, JSON.stringify([{ id: taskId, title: 'Task' }]));
      await redis.set(itemKey, JSON.stringify({ id: taskId, title: 'Task' }));

      // Invalida ambas as entradas (simula update de task)
      await redis.del(listKey, itemKey);

      const listResult = await redis.get(listKey);
      const itemResult = await redis.get(itemKey);

      expect(listResult).toBeNull();
      expect(itemResult).toBeNull();
    });
  });

  describe('Hash Operations (Alternative caching pattern)', () => {
    it('should store and retrieve hash fields', async () => {
      const key = `user:profile:${Date.now()}`;

      await redis.hset(key, {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      });

      const name = await redis.hget(key, 'name');
      const all = await redis.hgetall(key);

      expect(name).toBe('Test User');
      expect(all).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      });

      // Cleanup
      await redis.del(key);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent set operations', async () => {
      const baseKey = `concurrent-set-${Date.now()}`;
      const operations = Array.from({ length: 10 }, (_, i) => ({
        key: `${baseKey}-${i}`,
        value: JSON.stringify({ index: i, data: `value-${i}` }),
      }));

      // Executa em paralelo
      await Promise.all(
        operations.map(({ key, value }) => redis.set(key, value)),
      );

      // Verifica todos
      const results = await Promise.all(
        operations.map(({ key }) => redis.get(key)),
      );

      results.forEach((result, index) => {
        expect(JSON.parse(result!)).toEqual({ index, data: `value-${index}` });
      });

      // Cleanup
      await Promise.all(operations.map(({ key }) => redis.del(key)));
    });

    it('should handle pipeline operations', async () => {
      const baseKey = `pipeline-${Date.now()}`;
      const pipeline = redis.pipeline();

      // Adiciona múltiplas operações ao pipeline
      for (let i = 0; i < 5; i++) {
        pipeline.set(`${baseKey}-${i}`, `value-${i}`);
      }

      // Executa todas de uma vez
      const results = await pipeline.exec();

      expect(results).toHaveLength(5);
      results!.forEach(([err, result]) => {
        expect(err).toBeNull();
        expect(result).toBe('OK');
      });

      // Cleanup
      for (let i = 0; i < 5; i++) {
        await redis.del(`${baseKey}-${i}`);
      }
    });
  });

  describe('Atomic Operations', () => {
    it('should increment counter atomically', async () => {
      const key = `counter-${Date.now()}`;

      await redis.set(key, '0');

      // Incrementa 5 vezes em paralelo
      await Promise.all(Array.from({ length: 5 }, () => redis.incr(key)));

      const result = await redis.get(key);
      expect(parseInt(result!, 10)).toBe(5);

      // Cleanup
      await redis.del(key);
    });

    it('should handle SETNX (set if not exists)', async () => {
      const key = `setnx-${Date.now()}`;
      const value1 = 'first';
      const value2 = 'second';

      // Primeira tentativa deve funcionar
      const result1 = await redis.setnx(key, value1);
      expect(result1).toBe(1);

      // Segunda tentativa deve falhar
      const result2 = await redis.setnx(key, value2);
      expect(result2).toBe(0);

      // Valor deve ser o primeiro
      const stored = await redis.get(key);
      expect(stored).toBe(value1);

      // Cleanup
      await redis.del(key);
    });
  });
});
