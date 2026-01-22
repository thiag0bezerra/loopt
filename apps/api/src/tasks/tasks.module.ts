import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Tag } from './entities/tag.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { NotificationsModule } from '../notifications';
import { UsersModule } from '../users/users.module';

/**
 * Módulo responsável pelo gerenciamento de tarefas e tags
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Tag]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [TasksController, TagsController],
  providers: [TasksService, TagsService],
  exports: [TasksService, TagsService],
})
export class TasksModule {}
