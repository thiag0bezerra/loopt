import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskNotificationPayload } from './interfaces';
import { RABBITMQ_CLIENT, TASK_CREATED_HIGH_PATTERN } from './constants';

/**
 * Serviço responsável por enviar notificações via RabbitMQ
 */
@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(RABBITMQ_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  /**
   * Conecta ao RabbitMQ ao iniciar o módulo
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Conectado ao RabbitMQ');
    } catch (error) {
      this.logger.error('Erro ao conectar ao RabbitMQ', error);
    }
  }

  /**
   * Envia notificação para tarefas de alta prioridade
   * @param task Tarefa de alta prioridade criada
   * @param user Usuário proprietário da tarefa
   */
  sendHighPriorityNotification(task: Task, user: User): void {
    const payload: TaskNotificationPayload = {
      taskId: task.id,
      taskTitle: task.title,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      createdAt: task.createdAt,
    };

    this.logger.log(
      `Enviando notificação de tarefa de alta prioridade: ${task.title}`,
    );

    this.client.emit<void, TaskNotificationPayload>(
      TASK_CREATED_HIGH_PATTERN,
      payload,
    );
  }
}
