import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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

/**
 * Chave de cache para queries de analytics
 */
export const ANALYTICS_QUERY_KEY = 'analytics';

/**
 * Hook para buscar visão geral das métricas
 * @returns Query do React Query com dados do overview
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'overview'],
    queryFn: async (): Promise<AnalyticsOverviewResponse> => {
      const { data } = await api.get<AnalyticsOverviewResponse>(
        '/analytics/overview',
      );
      return data;
    },
  });
}

/**
 * Hook para buscar distribuição por status
 * @returns Query do React Query com distribuição por status
 */
export function useAnalyticsByStatus() {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'by-status'],
    queryFn: async (): Promise<StatusDistribution[]> => {
      const { data } = await api.get<StatusDistribution[]>(
        '/analytics/by-status',
      );
      return data;
    },
  });
}

/**
 * Hook para buscar distribuição por prioridade
 * @returns Query do React Query com distribuição por prioridade
 */
export function useAnalyticsByPriority() {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'by-priority'],
    queryFn: async (): Promise<PriorityDistribution[]> => {
      const { data } = await api.get<PriorityDistribution[]>(
        '/analytics/by-priority',
      );
      return data;
    },
  });
}

/**
 * Hook para buscar tendência de conclusão
 * @param days - Número de dias para análise (default: 7)
 * @returns Query do React Query com tendência de conclusão
 */
export function useCompletionTrend(days: number = 7) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'completion-trend', days],
    queryFn: async (): Promise<CompletionTrendItem[]> => {
      const { data } = await api.get<CompletionTrendItem[]>(
        '/analytics/completion-trend',
        { params: { days } },
      );
      return data;
    },
  });
}

/**
 * Hook para buscar métricas de produtividade
 * @returns Query do React Query com métricas de produtividade
 */
export function useProductivityMetrics() {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'productivity'],
    queryFn: async (): Promise<ProductivityMetrics> => {
      const { data } = await api.get<ProductivityMetrics>(
        '/analytics/productivity',
      );
      return data;
    },
  });
}
