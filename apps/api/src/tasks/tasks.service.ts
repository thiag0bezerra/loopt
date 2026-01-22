import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus, TaskPriority, PaginatedResponse } from '@loopt/shared';
import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto';
import { CacheService } from '../cache';
import { NotificationsService } from '../notifications';
import { UsersService } from '../users/users.service';
import { TagsService } from './tags.service';
import { TasksGateway } from './tasks.gateway';

/** TTL do cache em milissegundos (5 minutos) */
const CACHE_TTL = 300_000;

/**
 * Serviço responsável pela lógica de negócio das tarefas
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly cacheService: CacheService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
    private readonly tasksGateway: TasksGateway,
  ) {}

  /**
   * Cria uma nova tarefa vinculada ao usuário
   * @param userId ID do usuário proprietário
   * @param dto Dados da tarefa a ser criada
   * @returns Tarefa criada
   */
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    // Busca tags se fornecidas
    const tags = dto.tagIds
      ? await this.tagsService.findByIds(userId, dto.tagIds)
      : [];

    const task = this.tasksRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId,
      tags,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Invalida cache do usuário após criar tarefa
    await this.invalidateUserCache(userId);

    // Emite evento WebSocket para atualização em tempo real
    this.tasksGateway.emitTaskCreated(userId, savedTask);

    // Envia notificação se a tarefa for de alta prioridade
    if (savedTask.priority === TaskPriority.HIGH) {
      const user = await this.usersService.findById(userId);
      if (user) {
        this.notificationsService.sendHighPriorityNotification(savedTask, user);
      }
    }

    return savedTask;
  }

  /**
   * Lista tarefas do usuário com filtros e paginação
   * @param userId ID do usuário proprietário
   * @param filters Filtros de busca
   * @returns Resposta paginada com tarefas
   */
  async findAll(
    userId: string,
    filters: TaskFilterDto,
  ): Promise<PaginatedResponse<Task>> {
    const {
      status,
      priority,
      search,
      tagId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    // Gera chave de cache e verifica se existe
    const cacheKey = this.cacheService.generateTasksCacheKey(userId, filters);
    const cached =
      await this.cacheService.get<PaginatedResponse<Task>>(cacheKey);

    if (cached) {
      return cached;
    }

    // Usa QueryBuilder para suportar filtro por tagId via relacionamento
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .where('task.userId = :userId', { userId });

    // Filtros básicos
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    // Filtro por tagId
    if (tagId) {
      queryBuilder.andWhere('tag.id = :tagId', { tagId });
    }

    // Busca por texto em título e descrição
    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ordenação e paginação
    queryBuilder
      .orderBy(`task.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const result: PaginatedResponse<Task> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    // Salva no cache
    await this.cacheService.set(cacheKey, result, CACHE_TTL);

    return result;
  }

  /**
   * Busca uma tarefa específica do usuário
   * @param userId ID do usuário proprietário
   * @param taskId ID da tarefa
   * @returns Tarefa encontrada
   * @throws NotFoundException se a tarefa não for encontrada
   */
  async findOne(userId: string, taskId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, userId },
      relations: ['tags'],
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return task;
  }

  /**
   * Atualiza uma tarefa existente
   * @param userId ID do usuário proprietário
   * @param taskId ID da tarefa
   * @param dto Dados a serem atualizados
   * @returns Tarefa atualizada
   * @throws NotFoundException se a tarefa não for encontrada
   */
  async update(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(userId, taskId);

    // Atualiza completedAt com base na mudança de status
    if (dto.status !== undefined) {
      if (
        dto.status === TaskStatus.COMPLETED &&
        task.status !== TaskStatus.COMPLETED
      ) {
        task.completedAt = new Date();
      } else if (
        dto.status !== TaskStatus.COMPLETED &&
        task.status === TaskStatus.COMPLETED
      ) {
        task.completedAt = null;
      }
    }

    // Atualiza tags se fornecidas
    if (dto.tagIds !== undefined) {
      task.tags =
        dto.tagIds.length > 0
          ? await this.tagsService.findByIds(userId, dto.tagIds)
          : [];
    }

    // Mescla os dados atualizados (exceto tagIds que já foi tratado)
    const { tagIds, ...updateData } = dto;
    Object.assign(task, {
      ...updateData,
      dueDate:
        dto.dueDate !== undefined
          ? dto.dueDate
            ? new Date(dto.dueDate)
            : null
          : task.dueDate,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Invalida cache do usuário após atualizar tarefa
    await this.invalidateUserCache(userId);

    // Emite evento WebSocket para atualização em tempo real
    this.tasksGateway.emitTaskUpdated(userId, savedTask);

    return savedTask;
  }

  /**
   * Remove uma tarefa
   * @param userId ID do usuário proprietário
   * @param taskId ID da tarefa
   * @throws NotFoundException se a tarefa não for encontrada
   */
  async remove(userId: string, taskId: string): Promise<void> {
    const task = await this.findOne(userId, taskId);
    await this.tasksRepository.remove(task);

    // Invalida cache do usuário após remover tarefa
    await this.invalidateUserCache(userId);

    // Emite evento WebSocket para atualização em tempo real
    this.tasksGateway.emitTaskDeleted(userId, taskId);
  }

  /**
   * Invalida todas as chaves de cache do usuário
   * @param userId ID do usuário
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.cacheService.delByPattern(`tasks:${userId}:*`),
      this.cacheService.delByPattern(`analytics:${userId}:*`),
    ]);
  }
}
