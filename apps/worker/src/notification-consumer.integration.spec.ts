import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NotificationConsumerService } from './notification-consumer.service';
import { RmqContext } from '@nestjs/microservices';

/**
 * Interface que define o payload de uma notificação de tarefa
 */
interface TaskNotificationPayload {
  taskId: string;
  taskTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: Date;
}

/**
 * Testes de integração para validar o funcionamento do consumer de mensagens.
 *
 * Valida:
 * - Processamento correto de mensagens de alta prioridade
 * - Acknowledge e Nack de mensagens
 * - Formato do payload
 * - Tratamento de erros
 */
describe('Worker Consumer Integration Tests', () => {
  let module: TestingModule;
  let consumerService: NotificationConsumerService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [NotificationConsumerService],
    }).compile();

    consumerService = module.get<NotificationConsumerService>(
      NotificationConsumerService,
    );
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Consumer Service Initialization', () => {
    it('should initialize consumer service', () => {
      expect(consumerService).toBeDefined();
    });
  });

  describe('High Priority Task Handler', () => {
    it('should process high priority task notification successfully', async () => {
      const mockPayload: TaskNotificationPayload = {
        taskId: `consumer-test-${Date.now()}`,
        taskTitle: 'High Priority Consumer Test',
        userId: 'test-user-consumer',
        userEmail: 'consumer@example.com',
        userName: 'Consumer Test User',
        createdAt: new Date(),
      };

      // Mock do contexto RabbitMQ
      const mockAck = vi.fn();
      const mockNack = vi.fn();
      const mockChannel = {
        ack: mockAck,
        nack: mockNack,
      };
      const mockOriginalMsg = {
        content: Buffer.from(JSON.stringify(mockPayload)),
      };

      const mockContext = {
        getChannelRef: () => mockChannel,
        getMessage: () => mockOriginalMsg,
      } as unknown as RmqContext;

      // Executa o handler
      await consumerService.handleHighPriorityTask(mockPayload, mockContext);

      // Verifica que o ack foi chamado (mensagem processada com sucesso)
      expect(mockAck).toHaveBeenCalledWith(mockOriginalMsg);
      expect(mockNack).not.toHaveBeenCalled();
    });

    it('should handle valid payload with all required fields', async () => {
      const validPayload: TaskNotificationPayload = {
        taskId: 'valid-task-123',
        taskTitle: 'Valid Task Title',
        userId: 'valid-user-456',
        userEmail: 'valid@example.com',
        userName: 'Valid User Name',
        createdAt: new Date('2025-01-23T10:00:00Z'),
      };

      const mockAck = vi.fn();
      const mockContext = {
        getChannelRef: () => ({ ack: mockAck, nack: vi.fn() }),
        getMessage: () => ({}),
      } as unknown as RmqContext;

      await consumerService.handleHighPriorityTask(validPayload, mockContext);

      expect(mockAck).toHaveBeenCalled();
    });

    it('should handle special characters in payload', async () => {
      const specialPayload: TaskNotificationPayload = {
        taskId: 'special-chars-task',
        taskTitle: 'Tarefa com acentos: áéíóú e emojis 🎉🚀',
        userId: 'user-with-中文',
        userEmail: 'usuario@example.com',
        userName: 'José María García',
        createdAt: new Date(),
      };

      const mockAck = vi.fn();
      const mockContext = {
        getChannelRef: () => ({ ack: mockAck, nack: vi.fn() }),
        getMessage: () => ({}),
      } as unknown as RmqContext;

      await consumerService.handleHighPriorityTask(specialPayload, mockContext);

      expect(mockAck).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should nack message when handler throws error', async () => {
      // Silencia o logger durante este teste para evitar poluição no output
      const loggerErrorSpy = vi
        .spyOn(consumerService['logger'], 'error')
        .mockImplementation(() => {});

      const mockPayload: TaskNotificationPayload = {
        taskId: 'error-task',
        taskTitle: 'Error Test Task',
        userId: 'error-user',
        userEmail: 'error@example.com',
        userName: 'Error User',
        createdAt: new Date(),
      };

      const mockNack = vi.fn();
      const mockOriginalMsg = {};

      // Cria um mock de context que vai causar erro
      const mockContext = {
        getChannelRef: () => ({
          ack: () => {
            throw new Error('Simulated processing error');
          },
          nack: mockNack,
        }),
        getMessage: () => mockOriginalMsg,
      } as unknown as RmqContext;

      // O handler deve capturar o erro e fazer nack
      await consumerService.handleHighPriorityTask(mockPayload, mockContext);

      // Restaura o logger
      loggerErrorSpy.mockRestore();

      // Quando ack falha, deve chamar nack com requeue=true
      expect(mockNack).toHaveBeenCalledWith(mockOriginalMsg, false, true);
    });
  });

  describe('Message Acknowledgment', () => {
    it('should acknowledge message after successful processing', async () => {
      const payload: TaskNotificationPayload = {
        taskId: 'ack-test-task',
        taskTitle: 'Ack Test',
        userId: 'ack-user',
        userEmail: 'ack@test.com',
        userName: 'Ack User',
        createdAt: new Date(),
      };

      const mockAck = vi.fn();
      const mockMsg = { fields: { deliveryTag: 123 } };
      const mockContext = {
        getChannelRef: () => ({ ack: mockAck, nack: vi.fn() }),
        getMessage: () => mockMsg,
      } as unknown as RmqContext;

      await consumerService.handleHighPriorityTask(payload, mockContext);

      expect(mockAck).toHaveBeenCalledWith(mockMsg);
    });
  });

  describe('Payload Validation', () => {
    it('should process payload with minimal required fields', async () => {
      const minimalPayload: TaskNotificationPayload = {
        taskId: 'min-1',
        taskTitle: 'T',
        userId: 'u',
        userEmail: 'a@b.c',
        userName: 'A',
        createdAt: new Date(),
      };

      const mockAck = vi.fn();
      const mockContext = {
        getChannelRef: () => ({ ack: mockAck, nack: vi.fn() }),
        getMessage: () => ({}),
      } as unknown as RmqContext;

      await consumerService.handleHighPriorityTask(minimalPayload, mockContext);

      expect(mockAck).toHaveBeenCalled();
    });

    it('should process payload with long strings', async () => {
      const longPayload: TaskNotificationPayload = {
        taskId: 'a'.repeat(100),
        taskTitle: 'b'.repeat(500),
        userId: 'c'.repeat(50),
        userEmail: 'd'.repeat(50) + '@example.com',
        userName: 'e'.repeat(100),
        createdAt: new Date(),
      };

      const mockAck = vi.fn();
      const mockContext = {
        getChannelRef: () => ({ ack: mockAck, nack: vi.fn() }),
        getMessage: () => ({}),
      } as unknown as RmqContext;

      await consumerService.handleHighPriorityTask(longPayload, mockContext);

      expect(mockAck).toHaveBeenCalled();
    });
  });

  describe('Multiple Messages Processing', () => {
    it('should process multiple messages in sequence', async () => {
      const messages = Array.from({ length: 5 }, (_, i) => ({
        taskId: `seq-task-${i}`,
        taskTitle: `Sequential Task ${i}`,
        userId: `seq-user-${i}`,
        userEmail: `seq${i}@example.com`,
        userName: `Sequential User ${i}`,
        createdAt: new Date(),
      }));

      const ackCalls: number[] = [];

      for (let i = 0; i < messages.length; i++) {
        const mockAck = vi.fn(() => ackCalls.push(i));
        const mockContext = {
          getChannelRef: () => ({ ack: mockAck, nack: vi.fn() }),
          getMessage: () => ({}),
        } as unknown as RmqContext;

        await consumerService.handleHighPriorityTask(messages[i], mockContext);
      }

      // Todas as mensagens devem ter sido processadas
      expect(ackCalls).toHaveLength(5);
      expect(ackCalls).toEqual([0, 1, 2, 3, 4]);
    });
  });
});
