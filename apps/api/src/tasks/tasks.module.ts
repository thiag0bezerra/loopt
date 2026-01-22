import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Task } from './entities/task.entity';
import { Tag } from './entities/tag.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TasksGateway } from './tasks.gateway';
import { NotificationsModule } from '../notifications';
import { UsersModule } from '../users/users.module';

/**
 * Módulo responsável pelo gerenciamento de tarefas e tags.
 * Inclui suporte a WebSocket para atualizações em tempo real.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Tag]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [TasksController, TagsController],
  providers: [TasksService, TagsService, TasksGateway],
  exports: [TasksService, TagsService, TasksGateway],
})
export class TasksModule {}
