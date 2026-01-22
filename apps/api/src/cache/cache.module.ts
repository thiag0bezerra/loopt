import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';

import { CacheService } from './cache.service';

/** TTL padrão do cache em milissegundos (5 minutos) */
const DEFAULT_CACHE_TTL = 300_000;

/**
 * Módulo global de cache usando Redis como store
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const redisUrl = `redis://${host}:${port}`;
        const logger = new Logger('CacheModule');

        logger.log(`Connecting to Redis at ${redisUrl}`);

        const keyvRedis = new KeyvRedis(redisUrl);
        const keyv = new Keyv({ store: keyvRedis, namespace: 'loopt' });

        return {
          stores: [keyv],
          ttl: DEFAULT_CACHE_TTL,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheConfigModule {}
