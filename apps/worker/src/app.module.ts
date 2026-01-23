import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationConsumerService } from './notification-consumer.service';
import { validate } from './config/env.validation';

/**
 * Módulo principal do worker
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
  providers: [NotificationConsumerService],
})
export class AppModule {}
