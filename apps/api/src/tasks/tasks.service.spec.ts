import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';

import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskStatus, TaskPriority } from '@loopt/shared';

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
  };

  const mockTasksRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    findAndCount: vi.fn(),
    remove: vi.fn(),
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

      const result = await tasksService.create(mockUserId, createTaskDto);

      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        dueDate: null,
        userId: mockUserId,
      });
      expect(mockTasksRepository.save).toHaveBeenCalledWith(expectedTask);
      expect(result.userId).toBe(mockUserId);
    });
  });

  describe('findAll', () => {
    it('deve retornar apenas tarefas do usuário', async () => {
      const tasks = [mockTask];
      mockTasksRepository.findAndCount.mockResolvedValue([tasks, 1]);

      const result = await tasksService.findAll(mockUserId, {});

      expect(mockTasksRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [{ userId: mockUserId }],
        }),
      );
      expect(result.data).toEqual(tasks);
      expect(result.meta.total).toBe(1);
    });

    it('deve aplicar filtros corretamente', async () => {
      const tasks = [mockTask];
      mockTasksRepository.findAndCount.mockResolvedValue([tasks, 1]);

      const filters = {
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      await tasksService.findAll(mockUserId, filters);

      expect(mockTasksRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            {
              userId: mockUserId,
              status: TaskStatus.PENDING,
              priority: TaskPriority.HIGH,
            },
          ],
          order: { createdAt: 'DESC' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('deve aplicar busca em título e descrição', async () => {
      const tasks = [mockTask];
      mockTasksRepository.findAndCount.mockResolvedValue([tasks, 1]);

      const filters = {
        search: 'test',
      };

      await tasksService.findAll(mockUserId, filters);

      expect(mockTasksRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { userId: mockUserId, title: ILike('%test%') },
            { userId: mockUserId, description: ILike('%test%') },
          ],
        }),
      );
    });

    it('deve retornar paginação correta', async () => {
      const tasks = [mockTask];
      mockTasksRepository.findAndCount.mockResolvedValue([tasks, 25]);

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
  });

  describe('findOne', () => {
    it('deve retornar tarefa existente', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.findOne(mockUserId, mockTask.id);

      expect(result).toEqual(mockTask);
      expect(mockTasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id, userId: mockUserId },
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

      const result = await tasksService.update(
        mockUserId,
        mockTask.id,
        updateDto,
      );

      expect(result.title).toBe('Updated Title');
    });

    it('deve preencher completedAt quando status = COMPLETED', async () => {
      const updateDto = { status: TaskStatus.COMPLETED };
      const taskBeforeUpdate = { ...mockTask, status: TaskStatus.PENDING };

      mockTasksRepository.findOne.mockResolvedValue(taskBeforeUpdate);
      mockTasksRepository.save.mockImplementation((task) => Promise.resolve(task));

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
      mockTasksRepository.save.mockImplementation((task) => Promise.resolve(task));

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

      await tasksService.remove(mockUserId, mockTask.id);

      expect(mockTasksRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('deve lançar NotFoundException para tarefa inexistente', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(
        tasksService.remove(mockUserId, 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
