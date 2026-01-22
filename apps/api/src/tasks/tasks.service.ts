import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { TaskStatus, PaginatedResponse } from '@loopt/shared';
import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto';
import { CacheService } from '../cache';

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
  ) {}

  /**
   * Cria uma nova tarefa vinculada ao usuário
   * @param userId ID do usuário proprietário
   * @param dto Dados da tarefa a ser criada
   * @returns Tarefa criada
   */
  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Invalida cache do usuário após criar tarefa
    await this.invalidateUserCache(userId);

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
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    // Gera chave de cache e verifica se existe
    const cacheKey = this.cacheService.generateTasksCacheKey(userId, filters);
    const cached = await this.cacheService.get<PaginatedResponse<Task>>(cacheKey);

    if (cached) {
      return cached;
    }

    const where: FindOptionsWhere<Task>[] = [];
    const baseWhere: FindOptionsWhere<Task> = { userId };

    // Filtros básicos
    if (status) {
      baseWhere.status = status;
    }
    if (priority) {
      baseWhere.priority = priority;
    }

    // Busca por texto em título e descrição
    if (search) {
      where.push(
        { ...baseWhere, title: ILike(`%${search}%`) },
        { ...baseWhere, description: ILike(`%${search}%`) },
      );
    } else {
      where.push(baseWhere);
    }

    const [data, total] = await this.tasksRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

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

    // Mescla os dados atualizados
    Object.assign(task, {
      ...dto,
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
  }

  /**
   * Invalida todas as chaves de cache do usuário
   * @param userId ID do usuário
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.delByPattern(`tasks:${userId}:*`);
  }
}
