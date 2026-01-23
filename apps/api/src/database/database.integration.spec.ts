import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Tag } from '../tasks/entities/tag.entity';
import { TaskStatus, TaskPriority } from '@loopt/shared';

/**
 * Testes de integração para validar a conexão e operações com o banco de dados PostgreSQL.
 *
 * IMPORTANTE: Requer que o PostgreSQL esteja rodando (docker compose up postgres)
 *
 * Executa operações CRUD reais para garantir:
 * - Conexão com o banco de dados
 * - Criação de entidades
 * - Relacionamentos entre entidades
 * - Queries e filtros
 */
describe('Database Integration Tests', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let taskRepository: Repository<Task>;
  let tagRepository: Repository<Tag>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '../../.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'loopt'),
            password: configService.get<string>('DB_PASSWORD', 'loopt'),
            database: configService.get<string>('DB_DATABASE', 'loopt'),
            entities: [User, Task, Tag],
            synchronize: false,
            logging: false,
          }),
        }),
        TypeOrmModule.forFeature([User, Task, Tag]),
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Database Connection', () => {
    it('should connect to PostgreSQL successfully', async () => {
      expect(dataSource.isInitialized).toBe(true);
    });

    it('should be able to run raw queries', async () => {
      const result = await dataSource.query('SELECT NOW() as current_time');
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('current_time');
    });

    it('should have correct database name', async () => {
      const result = await dataSource.query('SELECT current_database()');
      expect(result[0].current_database).toBe('loopt');
    });
  });

  describe('User Entity CRUD Operations', () => {
    const testUserEmail = `test-integration-${Date.now()}@example.com`;
    let createdUserId: string;

    it('should create a new user', async () => {
      const user = userRepository.create({
        email: testUserEmail,
        password: 'hashedpassword123',
        name: 'Test Integration User',
      });

      const savedUser = await userRepository.save(user);
      createdUserId = savedUser.id;

      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe(testUserEmail);
      expect(savedUser.name).toBe('Test Integration User');
      expect(savedUser.createdAt).toBeInstanceOf(Date);
    });

    it('should read the created user', async () => {
      const foundUser = await userRepository.findOne({
        where: { id: createdUserId },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(testUserEmail);
    });

    it('should update the user', async () => {
      await userRepository.update(createdUserId, {
        name: 'Updated Integration User',
      });

      const updatedUser = await userRepository.findOne({
        where: { id: createdUserId },
      });

      expect(updatedUser!.name).toBe('Updated Integration User');
    });

    it('should delete the user', async () => {
      await userRepository.delete(createdUserId);

      const deletedUser = await userRepository.findOne({
        where: { id: createdUserId },
      });

      expect(deletedUser).toBeNull();
    });
  });

  describe('Task Entity with Relationships', () => {
    let testUser: User;
    let testTask: Task;
    let testTag: Tag;

    beforeAll(async () => {
      // Cria usuário de teste uma única vez para todo o describe block
      const testUserEmail = `test-task-relation-${Date.now()}@example.com`;
      testUser = await userRepository.save(
        userRepository.create({
          email: testUserEmail,
          password: 'hashedpassword123',
          name: 'Task Relation Test User',
        }),
      );

      // Cria tag de teste
      testTag = await tagRepository.save(
        tagRepository.create({
          name: `test-tag-${Date.now()}`,
          color: '#FF5733',
          userId: testUser.id,
        }),
      );
    });

    afterAll(async () => {
      // Cleanup na ordem correta (dependentes primeiro)
      if (testTask?.id) {
        await taskRepository.delete(testTask.id);
      }
      if (testTag?.id) {
        await tagRepository.delete(testTag.id);
      }
      if (testUser?.id) {
        await userRepository.delete(testUser.id);
      }
    });

    it('should create a task with user relationship', async () => {
      testTask = await taskRepository.save(
        taskRepository.create({
          title: 'Integration Test Task',
          description: 'Testing database relationships',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          userId: testUser.id,
        }),
      );

      expect(testTask.id).toBeDefined();
      expect(testTask.userId).toBe(testUser.id);
      expect(testTask.status).toBe(TaskStatus.PENDING);
      expect(testTask.priority).toBe(TaskPriority.HIGH);
    });

    it('should load task with user relation', async () => {
      const taskWithUser = await taskRepository.findOne({
        where: { id: testTask.id },
        relations: ['user'],
      });

      expect(taskWithUser).toBeDefined();
      expect(taskWithUser!.user).toBeDefined();
      expect(taskWithUser!.user.email).toBe(testUser.email);
    });

    it('should associate tags with task', async () => {
      testTask.tags = [testTag];
      await taskRepository.save(testTask);

      const taskWithTags = await taskRepository.findOne({
        where: { id: testTask.id },
        relations: ['tags'],
      });

      expect(taskWithTags!.tags).toHaveLength(1);
      expect(taskWithTags!.tags[0].name).toBe(testTag.name);
    });

    it('should query tasks by status and priority', async () => {
      const highPriorityPendingTasks = await taskRepository.find({
        where: {
          userId: testUser.id,
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
        },
      });

      expect(highPriorityPendingTasks.length).toBeGreaterThanOrEqual(1);
      expect(
        highPriorityPendingTasks.every(
          (t) =>
            t.priority === TaskPriority.HIGH && t.status === TaskStatus.PENDING,
        ),
      ).toBe(true);
    });
  });

  describe('Transaction Support', () => {
    it('should rollback transaction on error', async () => {
      const testEmail = `transaction-test-${Date.now()}@example.com`;

      await expect(
        dataSource.transaction(async (transactionalEntityManager) => {
          const user = transactionalEntityManager.create(User, {
            email: testEmail,
            password: 'test123',
            name: 'Transaction Test',
          });
          await transactionalEntityManager.save(user);

          // Força um erro para trigger rollback
          throw new Error('Intentional rollback');
        }),
      ).rejects.toThrow('Intentional rollback');

      // Verifica que o usuário não foi criado (rollback funcionou)
      const user = await userRepository.findOne({
        where: { email: testEmail },
      });
      expect(user).toBeNull();
    });

    it('should commit transaction successfully', async () => {
      const testEmail = `transaction-success-${Date.now()}@example.com`;
      let createdUserId: string;

      await dataSource.transaction(async (transactionalEntityManager) => {
        const user = transactionalEntityManager.create(User, {
          email: testEmail,
          password: 'test123',
          name: 'Transaction Success Test',
        });
        const savedUser = await transactionalEntityManager.save(user);
        createdUserId = savedUser.id;
      });

      // Verifica que o usuário foi criado
      const user = await userRepository.findOne({
        where: { email: testEmail },
      });
      expect(user).toBeDefined();
      expect(user!.email).toBe(testEmail);

      // Cleanup
      await userRepository.delete(createdUserId!);
    });
  });
});
