import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';

/** TTL padrão do cache em milissegundos (5 minutos) */
const DEFAULT_CACHE_TTL = 300_000;

/**
 * Serviço para operações de cache com Redis
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Obtém um valor do cache
   * @param key Chave do cache
   * @returns Valor encontrado ou undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cacheManager.get<T>(key);
    if (value !== undefined && value !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
    } else {
      this.logger.debug(`Cache MISS: ${key}`);
    }
    return value ?? undefined;
  }

  /**
   * Define um valor no cache
   * @param key Chave do cache
   * @param value Valor a ser armazenado
   * @param ttl TTL em milissegundos (padrão: 5 minutos)
   */
  async set(
    key: string,
    value: unknown,
    ttl: number = DEFAULT_CACHE_TTL,
  ): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
    this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Remove um valor do cache
   * @param key Chave do cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.logger.debug(`Cache DEL: ${key}`);
  }

  /**
   * Remove todas as chaves que correspondem a um padrão
   * @param pattern Padrão das chaves (ex: "tasks:user123:*")
   */
  async delByPattern(pattern: string): Promise<void> {
    // Acessa o store Keyv subjacente para usar iteração de chaves
    const stores = (this.cacheManager as unknown as { stores: Keyv[] }).stores;

    if (!stores || stores.length === 0) {
      this.logger.warn('No stores available for pattern deletion');
      return;
    }

    const keyv = stores[0];
    const keysToDelete: string[] = [];

    // Converte o padrão glob para regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);

    // Itera sobre as chaves usando o iterator do Keyv
    try {
      const iterator = keyv.iterator(keyv.opts?.namespace);
      for await (const entry of iterator) {
        const [key] = entry as [string, unknown];
        // Remove o namespace da chave para comparação
        const keyWithoutNamespace = key.replace(/^loopt:/, '');
        if (regex.test(keyWithoutNamespace)) {
          keysToDelete.push(keyWithoutNamespace);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Pattern deletion not fully supported, falling back to prefix deletion: ${error}`,
      );
    }

    // Deleta as chaves encontradas
    for (const key of keysToDelete) {
      await this.del(key);
    }

    this.logger.debug(
      `Cache DEL by pattern: ${pattern} (${keysToDelete.length} keys deleted)`,
    );
  }

  /**
   * Gera uma chave de cache para listagem de tarefas
   * @param userId ID do usuário
   * @param filters Filtros aplicados
   * @returns Chave de cache
   */
  generateTasksCacheKey(userId: string, filters: object): string {
    const filtersObj = filters as Record<string, unknown>;
    const sortedFilters = Object.keys(filtersObj)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = filtersObj[key];
          return acc;
        },
        {} as Record<string, unknown>,
      );
    return `tasks:${userId}:${JSON.stringify(sortedFilters)}`;
  }
}
