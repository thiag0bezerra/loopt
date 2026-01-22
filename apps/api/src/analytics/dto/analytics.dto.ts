/**
 * Interface para resposta do endpoint overview
 */
export interface AnalyticsOverviewResponse {
  /** Número total de tarefas */
  totalTasks: number;
  /** Número de tarefas concluídas */
  completedTasks: number;
  /** Número de tarefas pendentes */
  pendingTasks: number;
  /** Número de tarefas em progresso */
  inProgressTasks: number;
  /** Taxa de conclusão em percentual */
  completionRate: number;
  /** Número de tarefas atrasadas */
  overdueTasks: number;
  /** Número de tarefas com vencimento nos próximos 3 dias */
  dueSoon: number;
}

/**
 * Interface para distribuição por status
 */
export interface StatusDistribution {
  status: string;
  count: number;
}

/**
 * Interface para distribuição por prioridade
 */
export interface PriorityDistribution {
  priority: string;
  count: number;
}

/**
 * Interface para tendência de conclusão diária
 */
export interface CompletionTrendItem {
  date: string;
  completed: number;
  created: number;
}

/**
 * Interface para métricas de produtividade
 */
export interface ProductivityMetrics {
  /** Tempo médio de conclusão em horas */
  averageCompletionTime: number;
  /** Tarefas concluídas na semana atual */
  tasksCompletedThisWeek: number;
  /** Tarefas concluídas na semana anterior */
  tasksCompletedLastWeek: number;
  /** Variação semana a semana em percentual */
  weekOverWeekChange: number;
  /** Dias consecutivos com pelo menos 1 tarefa concluída */
  streakDays: number;
  /** Dia da semana mais produtivo */
  mostProductiveDay: string;
}
