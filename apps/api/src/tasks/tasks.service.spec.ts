import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskStatus, TaskPriority } from '@loopt/shared';
import { CacheService } from '../cache';
import { NotificationsService } from '../notifications';
import { UsersService } from '../users/users.service';
import { TagsService } from './tags.service';

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: Repository<Task>;

  const mockUserId = 'user-uuid-123';

  const mockTask: Task = {
    id: 'task-uuid-123',
    title: 'Test Task',
    description: 'Test description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2026-02-01'),
    userId: mockUserId,
    user: null as never,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    tags: [],
  };

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTasksRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    findAndCount: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockCacheService = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    delByPattern: vi.fn(),
    generateTasksCacheKey: vi.fn().mockReturnValue('tasks:user-uuid-123:{}'),
  };

  const mockNotificationsService = {
    sendHighPriorityNotification: vi.fn(),
  };

  const mockUsersService = {
    findById: vi.fn().mockResolvedValue(mockUser),
    findByEmail: vi.fn(),
    create: vi.fn(),
  };

  const mockTagsService = {
    findByIds: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  describe('create', () => {
    it('deve criar tarefa vinculada ao usuário', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'Task description',
        priority: TaskPriority.HIGH,
      };

      const expectedTask = {
        ...mockTask,
        ...createTaskDto,
        userId: mockUserId,
      };

      mockTasksRepository.create.mockReturnValue(expectedTask);
      mockTasksRepository.save.mockResolvedValue(expectedTask);
      mockCacheService.delByPattern.mockResolvedValue(undefined);

      const result = await tasksService.create(mockUserId, createTaskDto);

      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        dueDate: null,
        userId: mockUserId,
        tags: [],
      });
      expect(mockTasksRepository.save).toHaveBeenCalledWith(expectedTask);
      expect(result.userId).toBe(mockUserId);
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(
        `tasks:${mockUserId}:*`,
      );
    });
  });

  describe('findAll', () => {
    let mockQueryBuilder: {
      leftJoinAndSelect: ReturnType<typeof vi.fn>;
      where: ReturnType<typeof vi.fn>;
      andWhere: ReturnType<typeof vi.fn>;
      orderBy: ReturnType<typeof vi.fn>;
      skip: ReturnType<typeof vi.fn>;
      take: ReturnType<typeof vi.fn>;
      getManyAndCount: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockTask], 1]),
      };
      mockTasksRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('deve retornar apenas tarefas do usuário', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await tasksService.findAll(mockUserId, {});

      expect(mockTasksRepository.createQueryBuilder).toHaveBeenCalledWith(
        'task',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'task.tags',
        'tag',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'task.userId = :userId',
        { userId: mockUserId },
      );
      expect(result.data).toEqual([mockTask]);
      expect(result.meta.total).toBe(1);
    });

    it('deve aplicar filtros corretamente', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);

      const filters = {
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      await tasksService.findAll(mockUserId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.PENDING },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.priority = :priority',
        { priority: TaskPriority.HIGH },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'task.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('deve aplicar busca em título e descrição', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);

      const filters = {
        search: 'test',
      };

      await tasksService.findAll(mockUserId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: '%test%' },
      );
    });

    it('deve retornar paginação correta', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 25]);
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await tasksService.findAll(mockUserId, {
        page: 2,
        limit: 10,
      });

      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('deve retornar dados do cache se existir', async () => {
      const cachedResult = {
        data: [mockTask],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockCacheService.get.mockResolvedValue(cachedResult);

      const result = await tasksService.findAll(mockUserId, {});

      expect(result).toEqual(cachedResult);
      expect(mockTasksRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar tarefa existente', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.findOne(mockUserId, mockTask.id);

      expect(result).toEqual(mockTask);
      expect(mockTasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id, userId: mockUserId },
        relations: ['tags'],
      });
    });

    it('deve lançar NotFoundException para tarefa inexistente', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(
        tasksService.findOne(mockUserId, 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar campos da tarefa', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedTask = { ...mockTask, ...updateDto };

      mockTasksRepository.findOne.mockResolvedValue({ ...mockTask });
      mockTasksRepository.save.mockResolvedValue(updatedTask);
      mockCacheService.delByPattern.mockResolvedValue(undefined);

      const result = await tasksService.update(
        mockUserId,
        mockTask.id,
        updateDto,
      );

      expect(result.title).toBe('Updated Title');
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(
        `tasks:${mockUserId}:*`,
      );
    });

    it('deve preencher completedAt quando status = COMPLETED', async () => {
      const updateDto = { status: TaskStatus.COMPLETED };
      const taskBeforeUpdate = { ...mockTask, status: TaskStatus.PENDING };

      mockTasksRepository.findOne.mockResolvedValue(taskBeforeUpdate);
      mockTasksRepository.save.mockImplementation((task) =>
        Promise.resolve(task),
      );
      mockCacheService.delByPattern.mockResolvedValue(undefined);

      const result = await tasksService.update(
        mockUserId,
        mockTask.id,
        updateDto,
      );

      expect(result.status).toBe(TaskStatus.COMPLETED);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('deve limpar completedAt quando status muda de COMPLETED para outro', async () => {
      const updateDto = { status: TaskStatus.IN_PROGRESS };
      const completedTask = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      };

      mockTasksRepository.findOne.mockResolvedValue(completedTask);
      mockTasksRepository.save.mockImplementation((task) =>
        Promise.resolve(task),
      );
      mockCacheService.delByPattern.mockResolvedValue(undefined);

      const result = await tasksService.update(
        mockUserId,
        mockTask.id,
        updateDto,
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.completedAt).toBeNull();
    });
  });

  describe('remove', () => {
    it('deve deletar tarefa existente', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);
      mockTasksRepository.remove.mockResolvedValue(mockTask);
      mockCacheService.delByPattern.mockResolvedValue(undefined);

      await tasksService.remove(mockUserId, mockTask.id);

      expect(mockTasksRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(
        `tasks:${mockUserId}:*`,
      );
    });

    it('deve lançar NotFoundException para tarefa inexistente', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(
        tasksService.remove(mockUserId, 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
