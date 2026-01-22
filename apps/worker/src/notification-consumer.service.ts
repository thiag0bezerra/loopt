import { Controller, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';

/**
 * Interface que define o payload de uma notificação de tarefa
 */
interface TaskNotificationPayload {
  /** ID da tarefa */
  taskId: string;
  /** Título da tarefa */
  taskTitle: string;
  /** ID do usuário proprietário */
  userId: string;
  /** Email do usuário */
  userEmail: string;
  /** Nome do usuário */
  userName: string;
  /** Data de criação da tarefa */
  createdAt: Date;
}

/**
 * Serviço responsável por consumir mensagens de notificação do RabbitMQ
 */
@Controller()
export class NotificationConsumerService {
  private readonly logger = new Logger(NotificationConsumerService.name);

  /**
   * Handler para mensagens de tarefas de alta prioridade
   * @param payload Dados da notificação
   * @param context Contexto RabbitMQ
   */
  @MessagePattern('task.created.high')
  async handleHighPriorityTask(
    @Payload() payload: TaskNotificationPayload,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log('='.repeat(60));
      this.logger.log('📬 Nova notificação de tarefa de alta prioridade!');
      this.logger.log('='.repeat(60));
      this.logger.log(`📋 Tarefa: ${payload.taskTitle}`);
      this.logger.log(`🆔 ID: ${payload.taskId}`);
      this.logger.log(`👤 Usuário: ${payload.userName} (${payload.userEmail})`);
      this.logger.log(
        `📅 Criada em: ${new Date(payload.createdAt).toLocaleString('pt-BR')}`,
      );
      this.logger.log('='.repeat(60));

      // Simulação de envio de notificação
      this.logger.log('✉️ Simulando envio de email para: ' + payload.userEmail);
      this.logger.log('🔔 Notificação processada com sucesso!');

      // Acknowledge da mensagem
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error('Erro ao processar notificação:', error);

      // Requeue da mensagem em caso de erro
      channel.nack(originalMsg, false, true);
    }
  }
}
