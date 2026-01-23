import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Inicializa o worker como microservice conectado ao RabbitMQ
 */
async function bootstrap(): Promise<void> {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl!],
        queue: 'high-priority-tasks',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log('🚀 Worker microservice is listening for messages...');
}

void bootstrap();
