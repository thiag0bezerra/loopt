import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Task } from './entities/task.entity';

/**
 * Tipo do payload de usuário armazenado no socket
 */
interface SocketUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Tipo de ação para eventos de tarefa
 */
export type TaskEventAction = 'created' | 'updated' | 'deleted';

/**
 * Payload dos eventos de tarefa
 */
export interface TaskEventPayload {
  /** Tarefa afetada (null quando deletada) */
  task: Task | { id: string };
  /** Ação realizada */
  action: TaskEventAction;
}

/**
 * Gateway WebSocket para comunicação em tempo real de tarefas.
 * Utiliza Socket.IO com namespace /tasks.
 */
@WebSocketGateway({
  namespace: '/tasks',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TasksGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(TasksGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Chamado quando o gateway é inicializado
   * @param server - Instância do servidor Socket.IO
   */
  afterInit(server: Server): void {
    this.logger.log('TasksGateway inicializado');
    this.server = server;
  }

  /**
   * Autentica a conexão WebSocket via JWT no handshake.
   * Extrai o token do header Authorization ou query param.
   * @param client - Socket do cliente conectando
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`Conexão rejeitada: token não fornecido`);
        client.disconnect();
        return;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        name: string;
      }>(token, { secret: jwtSecret });

      // Armazena dados do usuário no socket para uso posterior
      const user: SocketUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      client.data.user = user;

      // Adiciona o cliente à room do usuário para isolamento de eventos
      await client.join(`user:${user.id}`);

      this.logger.log(`Cliente conectado: ${client.id} (user: ${user.id})`);
    } catch (error) {
      this.logger.warn(
        `Conexão rejeitada: token inválido - ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
      client.disconnect();
    }
  }

  /**
   * Chamado quando um cliente desconecta
   * @param client - Socket do cliente desconectando
   */
  handleDisconnect(client: Socket): void {
    const user = client.data.user as SocketUser | undefined;
    this.logger.log(
      `Cliente desconectado: ${client.id}${user ? ` (user: ${user.id})` : ''}`,
    );
  }

  /**
   * Emite evento para um usuário específico através de sua room
   * @param userId - ID do usuário destinatário
   * @param event - Nome do evento
   * @param payload - Dados do evento
   */
  emitToUser(userId: string, event: string, payload: TaskEventPayload): void {
    this.server.to(`user:${userId}`).emit(event, payload);
    this.logger.debug(
      `Evento '${event}' emitido para user:${userId} - action: ${payload.action}`,
    );
  }

  /**
   * Emite evento 'task:created' para o usuário
   * @param userId - ID do usuário proprietário da tarefa
   * @param task - Tarefa criada
   */
  emitTaskCreated(userId: string, task: Task): void {
    this.emitToUser(userId, 'task:created', {
      task,
      action: 'created',
    });
  }

  /**
   * Emite evento 'task:updated' para o usuário
   * @param userId - ID do usuário proprietário da tarefa
   * @param task - Tarefa atualizada
   */
  emitTaskUpdated(userId: string, task: Task): void {
    this.emitToUser(userId, 'task:updated', {
      task,
      action: 'updated',
    });
  }

  /**
   * Emite evento 'task:deleted' para o usuário
   * @param userId - ID do usuário proprietário da tarefa
   * @param taskId - ID da tarefa deletada
   */
  emitTaskDeleted(userId: string, taskId: string): void {
    this.emitToUser(userId, 'task:deleted', {
      task: { id: taskId },
      action: 'deleted',
    });
  }

  /**
   * Extrai o token JWT do handshake do cliente
   * @param client - Socket do cliente
   * @returns Token JWT ou undefined
   */
  private extractToken(client: Socket): string | undefined {
    // Tenta extrair do header Authorization
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Tenta extrair do query param 'token'
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    return undefined;
  }
}
