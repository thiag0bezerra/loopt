import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type {
  Task,
  PaginatedResponse,
  TaskStatus,
  TaskPriority,
} from '@loopt/shared';
import { AxiosError } from 'axios';

/**
 * Filtros para listagem de tarefas
 */
export interface TaskFilters {
  /** Filtrar por status */
  status?: TaskStatus;
  /** Filtrar por prioridade */
  priority?: TaskPriority;
  /** Busca em título e descrição */
  search?: string;
  /** Filtrar por ID da tag */
  tagId?: string;
  /** Número da página (default: 1) */
  page?: number;
  /** Limite por página (default: 10, max: 50) */
  limit?: number;
  /** Campo para ordenação (default: createdAt) */
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'dueDate'
    | 'title'
    | 'priority'
    | 'status';
  /** Direção da ordenação (default: DESC) */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Dados para criação de tarefa
 */
export interface CreateTaskInput {
  /** Título da tarefa */
  title: string;
  /** Descrição da tarefa */
  description?: string;
  /** Status da tarefa */
  status?: TaskStatus;
  /** Prioridade da tarefa */
  priority?: TaskPriority;
  /** Data de vencimento */
  dueDate?: string;
  /** IDs das tags */
  tagIds?: string[];
}

/**
 * Dados para atualização de tarefa
 */
export interface UpdateTaskInput {
  /** Título da tarefa */
  title?: string;
  /** Descrição da tarefa */
  description?: string | null;
  /** Status da tarefa */
  status?: TaskStatus;
  /** Prioridade da tarefa */
  priority?: TaskPriority;
  /** Data de vencimento */
  dueDate?: string | null;
  /** IDs das tags */
  tagIds?: string[];
}

/**
 * Erro retornado pela API
 */
interface ApiError {
  /** Mensagem de erro */
  message: string;
  /** Código de erro HTTP */
  statusCode: number;
}

/**
 * Chave de cache para queries de tarefas
 */
export const TASKS_QUERY_KEY = 'tasks';

/**
 * Chave de cache para query de tarefa individual
 */
export const TASK_QUERY_KEY = 'task';

/**
 * Hook para listar tarefas com filtros e paginação
 * @param filters - Filtros para listagem
 * @returns Query do React Query com tarefas paginadas
 */
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.tagId) params.append('tagId', filters.tagId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await api.get<PaginatedResponse<Task>>(
        `/tasks?${params.toString()}`,
      );
      return response.data;
    },
  });
}

/**
 * Hook para buscar uma tarefa específica por ID
 * @param id - ID da tarefa
 * @returns Query do React Query com a tarefa
 */
export function useTask(id: string | null) {
  return useQuery({
    queryKey: [TASK_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID da tarefa é obrigatório');
      const response = await api.get<Task>(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para criar uma nova tarefa
 * @returns Mutation do React Query para criação de tarefa
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await api.post<Task>('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        'Erro ao criar tarefa. Tente novamente.';
      toast.error(message);
    },
  });
}

/**
 * Hook para atualizar uma tarefa existente
 * @returns Mutation do React Query para atualização de tarefa
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const response = await api.patch<Task>(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [TASK_QUERY_KEY, updatedTask.id],
      });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        'Erro ao atualizar tarefa. Tente novamente.';
      toast.error(message);
    },
  });
}

/**
 * Hook para deletar uma tarefa
 * @returns Mutation do React Query para exclusão de tarefa
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('Tarefa excluída com sucesso!');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        'Erro ao excluir tarefa. Tente novamente.';
      toast.error(message);
    },
  });
}
