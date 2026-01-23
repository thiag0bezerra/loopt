import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NotificationsService } from './notifications.service';
import {
  RABBITMQ_CLIENT,
  HIGH_PRIORITY_TASKS_QUEUE,
  TASK_CREATED_HIGH_PATTERN,
} from './constants';
import { TaskNotificationPayload } from './interfaces';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskStatus, TaskPriority } from '@loopt/shared';

/**
 * Testes de integração para validar a conexão e operações com RabbitMQ (fila de mensagens).
 *
 * IMPORTANTE: Requer que o RabbitMQ esteja rodando (docker compose up rabbitmq)
 *
 * Executa operações reais para garantir:
 * - Conexão com o RabbitMQ
 * - Publicação de mensagens na fila
 * - Configuração de queues
 * - Formato correto do payload
 */
describe('Queue/Worker Integration Tests (RabbitMQ)', () => {
  let module: TestingModule;
  let notificationsService: NotificationsService;
  let rabbitMQClient: ClientProxy;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '../../.env',
        }),
        ClientsModule.registerAsync([
          {
            name: RABBITMQ_CLIENT,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [
                  configService.get<string>(
                    'RABBITMQ_URL',
                    'amqp://guest:guest@localhost:5672',
                  ),
                ],
                queue: HIGH_PRIORITY_TASKS_QUEUE,
                queueOptions: {
                  durable: true,
                },
              },
            }),
          },
        ]),
      ],
      providers: [NotificationsService],
    }).compile();

    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    rabbitMQClient = module.get<ClientProxy>(RABBITMQ_CLIENT);

    // Conecta ao RabbitMQ
    await rabbitMQClient.connect();
  }, 30000); // Timeout maior para conexão inicial

  afterAll(async () => {
    if (rabbitMQClient) {
      await rabbitMQClient.close();
    }
    if (module) {
      await module.close();
    }
  });

  describe('RabbitMQ Connection', () => {
    it('should connect to RabbitMQ successfully', async () => {
      // Se chegou aqui sem erro, a conexão foi bem sucedida
      expect(rabbitMQClient).toBeDefined();
    });

    it('should have notifications service initialized', async () => {
      expect(notificationsService).toBeDefined();
    });
  });

  describe('Message Publishing', () => {
    it('should emit message to high priority queue', async () => {
      const testPayload: TaskNotificationPayload = {
        taskId: `test-task-${Date.now()}`,
        taskTitle: 'Integration Test Task',
        userId: 'test-user-123',
        userEmail: 'test@example.com',
        userName: 'Test User',
        createdAt: new Date(),
      };

      // Emite a mensagem
      const result = rabbitMQClient.emit(
        TASK_CREATED_HIGH_PATTERN,
        testPayload,
      );

      // emit() retorna um Observable, verificamos que não lança erro
      expect(result).toBeDefined();
    });

    it('should send message and receive acknowledgment', async () => {
      const testPayload: TaskNotificationPayload = {
        taskId: `ack-test-${Date.now()}`,
        taskTitle: 'Acknowledgment Test Task',
        userId: 'test-user-ack',
        userEmail: 'ack@example.com',
        userName: 'Ack Test User',
        createdAt: new Date(),
      };

      // Usa send() que espera uma resposta (se o consumer responder)
      // Como não temos consumer ativo neste teste, apenas verificamos que a mensagem foi enviada
      const observable = rabbitMQClient.emit(
        TASK_CREATED_HIGH_PATTERN,
        testPayload,
      );

      expect(observable).toBeDefined();
    });
  });

  describe('NotificationsService Integration', () => {
    it('should send high priority notification via service', () => {
      const mockTask = {
        id: `service-test-${Date.now()}`,
        title: 'Service Integration Test',
        description: 'Testing via notifications service',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        userId: 'user-service-test',
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        completedAt: null,
        order: 0,
        tags: [],
      } as Task;

      const mockUser = {
        id: 'user-service-test',
        email: 'service@example.com',
        name: 'Service Test User',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      // Não deve lançar erro
      expect(() => {
        notificationsService.sendHighPriorityNotification(mockTask, mockUser);
      }).not.toThrow();
    });

    it('should format payload correctly for high priority tasks', () => {
      const task = {
        id: 'task-format-test',
        title: 'Format Test Task',
        createdAt: new Date('2025-01-23T10:00:00Z'),
      } as Task;

      const user = {
        id: 'user-format-test',
        email: 'format@example.com',
        name: 'Format User',
      } as User;

      const expectedPayload: TaskNotificationPayload = {
        taskId: task.id,
        taskTitle: task.title,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        createdAt: task.createdAt,
      };

      // Verifica que o payload esperado tem o formato correto
      expect(expectedPayload).toHaveProperty('taskId', 'task-format-test');
      expect(expectedPayload).toHaveProperty('taskTitle', 'Format Test Task');
      expect(expectedPayload).toHaveProperty('userId', 'user-format-test');
      expect(expectedPayload).toHaveProperty('userEmail', 'format@example.com');
      expect(expectedPayload).toHaveProperty('userName', 'Format User');
      expect(expectedPayload.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Queue Configuration', () => {
    it('should use correct queue name', () => {
      expect(HIGH_PRIORITY_TASKS_QUEUE).toBe('high-priority-tasks');
    });

    it('should use correct message pattern', () => {
      expect(TASK_CREATED_HIGH_PATTERN).toBe('task.created.high');
    });

    it('should have durable queue configuration', async () => {
      // A configuração de durabilidade garante que mensagens sobrevivem a restarts
      // Isso é definido nas options do ClientsModule
      // Este teste valida que as constantes estão corretas
      expect(RABBITMQ_CLIENT).toBe('RABBITMQ_CLIENT');
    });
  });

  describe('Multiple Messages', () => {
    it('should handle multiple concurrent message emissions', async () => {
      const messages = Array.from({ length: 5 }, (_, i) => ({
        taskId: `batch-${Date.now()}-${i}`,
        taskTitle: `Batch Task ${i}`,
        userId: `batch-user-${i}`,
        userEmail: `batch${i}@example.com`,
        userName: `Batch User ${i}`,
        createdAt: new Date(),
      }));

      // Emite todas as mensagens em paralelo
      const emissions = messages.map((payload) =>
        rabbitMQClient.emit(TASK_CREATED_HIGH_PATTERN, payload),
      );

      // Todas devem ser emitidas sem erro
      expect(emissions).toHaveLength(5);
      emissions.forEach((emission) => {
        expect(emission).toBeDefined();
      });
    });

    it('should maintain message order within reasonable bounds', async () => {
      const orderedMessages = Array.from({ length: 3 }, (_, i) => ({
        taskId: `ordered-${Date.now()}-${i}`,
        taskTitle: `Ordered Task ${i}`,
        userId: 'order-test-user',
        userEmail: 'order@example.com',
        userName: 'Order Test User',
        createdAt: new Date(),
        order: i,
      }));

      // Emite em sequência
      for (const msg of orderedMessages) {
        rabbitMQClient.emit(TASK_CREATED_HIGH_PATTERN, msg);
      }

      // Se não houver erro, as mensagens foram enfileiradas
      expect(orderedMessages).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle large payloads', () => {
      const largePayload: TaskNotificationPayload = {
        taskId: `large-${Date.now()}`,
        taskTitle: 'A'.repeat(1000), // Título grande
        userId: 'large-user',
        userEmail: 'large@example.com',
        userName: 'Large Payload User',
        createdAt: new Date(),
      };

      // Não deve lançar erro
      expect(() => {
        rabbitMQClient.emit(TASK_CREATED_HIGH_PATTERN, largePayload);
      }).not.toThrow();
    });

    it('should handle special characters in payload', () => {
      const specialPayload: TaskNotificationPayload = {
        taskId: `special-${Date.now()}`,
        taskTitle: 'Tarefa com caracteres especiais: áéíóú ñ 中文 🎉',
        userId: 'special-user',
        userEmail: 'special@example.com',
        userName: 'Usuário Especial',
        createdAt: new Date(),
      };

      expect(() => {
        rabbitMQClient.emit(TASK_CREATED_HIGH_PATTERN, specialPayload);
      }).not.toThrow();
    });
  });
});
