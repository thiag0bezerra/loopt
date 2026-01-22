import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { TaskStatus, PaginatedResponse } from '@loopt/shared';
import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto';

/**
 * Serviço responsável pela lógica de negócio das tarefas
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
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

    return this.tasksRepository.save(task);
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

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
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
      if (dto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
        task.completedAt = new Date();
      } else if (dto.status !== TaskStatus.COMPLETED && task.status === TaskStatus.COMPLETED) {
        task.completedAt = null;
      }
    }

    // Mescla os dados atualizados
    Object.assign(task, {
      ...dto,
      dueDate: dto.dueDate !== undefined 
        ? (dto.dueDate ? new Date(dto.dueDate) : null) 
        : task.dueDate,
    });

    return this.tasksRepository.save(task);
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
  }
}
