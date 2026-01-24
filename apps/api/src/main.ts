import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

/**
 * Bootstrap da aplicação NestJS
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar CORS
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Loopt API')
    .setDescription('API de gerenciamento de tarefas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? process.env.API_PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
  console.log(`Swagger documentation: /api`);
}

void bootstrap();
