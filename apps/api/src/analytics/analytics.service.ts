import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThanOrEqual, Not } from 'typeorm';
import { TaskStatus } from '@loopt/shared';
import { Task } from '../tasks/entities/task.entity';
import { CacheService } from '../cache';
import {
  AnalyticsOverviewResponse,
  StatusDistribution,
  PriorityDistribution,
  CompletionTrendItem,
  ProductivityMetrics,
} from './dto';

/** TTL do cache em milissegundos (5 minutos) */
const CACHE_TTL = 300_000;

/** Nomes dos dias da semana em português */
const WEEK_DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/**
 * Serviço responsável por cálculos de analytics e métricas de produtividade
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Obtém visão geral das métricas do usuário
   * @param userId ID do usuário
   * @returns Métricas gerais
   */
  async getOverview(userId: string): Promise<AnalyticsOverviewResponse> {
    const cacheKey = `analytics:${userId}:overview`;
    const cached =
      await this.cacheService.get<AnalyticsOverviewResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Contagem total de tarefas
    const totalTasks = await this.tasksRepository.count({
      where: { userId },
    });

    // Contagem por status
    const completedTasks = await this.tasksRepository.count({
      where: { userId, status: TaskStatus.COMPLETED },
    });

    const pendingTasks = await this.tasksRepository.count({
      where: { userId, status: TaskStatus.PENDING },
    });

    const inProgressTasks = await this.tasksRepository.count({
      where: { userId, status: TaskStatus.IN_PROGRESS },
    });

    // Taxa de conclusão
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tarefas atrasadas (dueDate < hoje e status != COMPLETED)
    const overdueTasks = await this.tasksRepository.count({
      where: {
        userId,
        dueDate: LessThan(today),
        status: Not(TaskStatus.COMPLETED),
      },
    });

    // Tarefas com vencimento nos próximos 3 dias (não concluídas)
    const dueSoon = await this.tasksRepository.count({
      where: {
        userId,
        dueDate: Between(today, threeDaysFromNow),
        status: Not(TaskStatus.COMPLETED),
      },
    });

    const result: AnalyticsOverviewResponse = {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      overdueTasks,
      dueSoon,
    };

    await this.cacheService.set(cacheKey, result, CACHE_TTL);

    return result;
  }

  /**
   * Obtém distribuição de tarefas por status
   * @param userId ID do usuário
   * @returns Array com contagem por status
   */
  async getByStatus(userId: string): Promise<StatusDistribution[]> {
    const cacheKey = `analytics:${userId}:by-status`;
    const cached = await this.cacheService.get<StatusDistribution[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .where('task.user_id = :userId', { userId })
      .groupBy('task.status')
      .getRawMany<StatusDistribution>();

    // Garante que todos os status estejam presentes
    const statusValues = Object.values(TaskStatus);
    const completeResult: StatusDistribution[] = statusValues.map((status) => {
      const found = result.find((r) => r.status === status);
      return {
        status,
        count: found ? Number(found.count) : 0,
      };
    });

    await this.cacheService.set(cacheKey, completeResult, CACHE_TTL);

    return completeResult;
  }

  /**
   * Obtém distribuição de tarefas por prioridade
   * @param userId ID do usuário
   * @returns Array com contagem por prioridade
   */
  async getByPriority(userId: string): Promise<PriorityDistribution[]> {
    const cacheKey = `analytics:${userId}:by-priority`;
    const cached =
      await this.cacheService.get<PriorityDistribution[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)::int', 'count')
      .where('task.user_id = :userId', { userId })
      .groupBy('task.priority')
      .getRawMany<PriorityDistribution>();

    // Garante que todas as prioridades estejam presentes
    const priorityValues = ['low', 'medium', 'high'];
    const completeResult: PriorityDistribution[] = priorityValues.map(
      (priority) => {
        const found = result.find((r) => r.priority === priority);
        return {
          priority,
          count: found ? Number(found.count) : 0,
        };
      },
    );

    await this.cacheService.set(cacheKey, completeResult, CACHE_TTL);

    return completeResult;
  }

  /**
   * Obtém tendência de conclusão de tarefas nos últimos N dias
   * @param userId ID do usuário
   * @param days Número de dias a considerar (padrão: 7)
   * @returns Array com dados diários de criação e conclusão
   */
  async getCompletionTrend(
    userId: string,
    days: number = 7,
  ): Promise<CompletionTrendItem[]> {
    const cacheKey = `analytics:${userId}:trend:${days}`;
    const cached = await this.cacheService.get<CompletionTrendItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // Busca tarefas criadas no período
    const createdTasks = await this.tasksRepository
      .createQueryBuilder('task')
      .select('DATE(task.created_at)', 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.created_at >= :startDate', { startDate })
      .groupBy('DATE(task.created_at)')
      .getRawMany<{ date: Date; count: number }>();

    // Busca tarefas completadas no período
    const completedTasks = await this.tasksRepository
      .createQueryBuilder('task')
      .select('DATE(task.completed_at)', 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.completed_at >= :startDate', { startDate })
      .groupBy('DATE(task.completed_at)')
      .getRawMany<{ date: Date; count: number }>();

    // Gera array com todos os dias do período
    const result: CompletionTrendItem[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];

      const created = createdTasks.find((t) => {
        // PostgreSQL retorna Date object, converter para string YYYY-MM-DD
        const taskDate =
          t.date instanceof Date
            ? t.date.toISOString().split('T')[0]
            : String(t.date).split('T')[0];
        return taskDate === dateStr;
      });

      const completed = completedTasks.find((t) => {
        // PostgreSQL retorna Date object, converter para string YYYY-MM-DD
        const taskDate =
          t.date instanceof Date
            ? t.date.toISOString().split('T')[0]
            : String(t.date).split('T')[0];
        return taskDate === dateStr;
      });

      result.push({
        date: dateStr,
        created: created ? Number(created.count) : 0,
        completed: completed ? Number(completed.count) : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    await this.cacheService.set(cacheKey, result, CACHE_TTL);

    return result;
  }

  /**
   * Obtém métricas de produtividade do usuário
   * @param userId ID do usuário
   * @returns Métricas de produtividade
   */
  async getProductivity(userId: string): Promise<ProductivityMetrics> {
    const cacheKey = `analytics:${userId}:productivity`;
    const cached = await this.cacheService.get<ProductivityMetrics>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();

    // Calcula início da semana atual e anterior (domingo)
    const currentWeekStart = this.getWeekStart(now);
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setMilliseconds(lastWeekEnd.getMilliseconds() - 1);

    // Tempo médio de conclusão (em horas)
    const avgResult = await this.tasksRepository
      .createQueryBuilder('task')
      .select(
        'AVG(EXTRACT(EPOCH FROM (task.completed_at - task.created_at)) / 3600)',
        'avgHours',
      )
      .where('task.user_id = :userId', { userId })
      .andWhere('task.completed_at IS NOT NULL')
      .getRawOne<{ avgHours: string | null }>();

    const averageCompletionTime = avgResult?.avgHours
      ? Math.round(parseFloat(avgResult.avgHours) * 100) / 100
      : 0;

    // Tarefas concluídas na semana atual
    const tasksCompletedThisWeek = await this.tasksRepository.count({
      where: {
        userId,
        completedAt: MoreThanOrEqual(currentWeekStart),
      },
    });

    // Tarefas concluídas na semana anterior
    const tasksCompletedLastWeek = await this.tasksRepository.count({
      where: {
        userId,
        completedAt: Between(lastWeekStart, lastWeekEnd),
      },
    });

    // Variação semana a semana
    const weekOverWeekChange =
      tasksCompletedLastWeek > 0
        ? Math.round(
            ((tasksCompletedThisWeek - tasksCompletedLastWeek) /
              tasksCompletedLastWeek) *
              100 *
              100,
          ) / 100
        : tasksCompletedThisWeek > 0
          ? 100
          : 0;

    // Calcula streak de dias consecutivos
    const streakDays = await this.calculateStreak(userId);

    // Dia mais produtivo
    const mostProductiveDay = await this.getMostProductiveDay(userId);

    const result: ProductivityMetrics = {
      averageCompletionTime,
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      weekOverWeekChange,
      streakDays,
      mostProductiveDay,
    };

    await this.cacheService.set(cacheKey, result, CACHE_TTL);

    return result;
  }

  /**
   * Calcula o início da semana (domingo) para uma data
   * @param date Data de referência
   * @returns Data do início da semana
   */
  private getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Calcula o número de dias consecutivos com tarefas concluídas
   * @param userId ID do usuário
   * @returns Número de dias em streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    const completedDays = await this.tasksRepository
      .createQueryBuilder('task')
      .select("DISTINCT DATE(task.completed_at AT TIME ZONE 'UTC')", 'date')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.completed_at IS NOT NULL')
      .orderBy('date', 'DESC')
      .getRawMany<{ date: Date }>();

    if (completedDays.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let expectedDate = new Date(today);

    for (const row of completedDays) {
      const completedDate = new Date(row.date);
      completedDate.setHours(0, 0, 0, 0);

      // Se é o primeiro dia verificado e não é hoje nem ontem, não há streak
      if (streak === 0) {
        const diffDays = Math.floor(
          (today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 1) {
          return 0;
        }
        expectedDate = completedDate;
      }

      if (completedDate.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Determina o dia da semana mais produtivo
   * @param userId ID do usuário
   * @returns Nome do dia mais produtivo
   */
  private async getMostProductiveDay(userId: string): Promise<string> {
    const result = await this.tasksRepository
      .createQueryBuilder('task')
      .select(
        "EXTRACT(DOW FROM task.completed_at AT TIME ZONE 'UTC')",
        'dayOfWeek',
      )
      .addSelect('COUNT(*)::int', 'count')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.completed_at IS NOT NULL')
      .groupBy("EXTRACT(DOW FROM task.completed_at AT TIME ZONE 'UTC')")
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne<{ dayOfWeek: string; count: number }>();

    if (!result) {
      return 'N/A';
    }

    const dayIndex = parseInt(result.dayOfWeek, 10);
    return WEEK_DAYS[dayIndex] || 'N/A';
  }
}
