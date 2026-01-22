import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationConsumerService } from './notification-consumer.service';

/**
 * Módulo principal do worker
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [NotificationConsumerService],
})
export class AppModule {}
