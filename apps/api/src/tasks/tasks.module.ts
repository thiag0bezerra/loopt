import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { NotificationsModule } from '../notifications';
import { UsersModule } from '../users/users.module';

/**
 * Módulo responsável pelo gerenciamento de tarefas
 */
@Module({
  imports: [TypeOrmModule.forFeature([Task]), NotificationsModule, UsersModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
