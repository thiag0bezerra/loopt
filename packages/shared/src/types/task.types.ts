import { TaskPriority, TaskStatus } from '../enums';

/**
 * Representa uma tarefa do sistema
 */
export interface Task {
  /** Identificador único da tarefa (UUID) */
  id: string;
  /** Título da tarefa */
  title: string;
  /** Descrição da tarefa (opcional) */
  description: string | null;
  /** Status atual da tarefa */
  status: TaskStatus;
  /** Prioridade da tarefa */
  priority: TaskPriority;
  /** Data de vencimento (opcional) */
  dueDate: Date | null;
  /** ID do usuário proprietário */
  userId: string;
  /** Data de criação */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
  /** Data de conclusão (preenchida quando status = COMPLETED) */
  completedAt: Date | null;
}

/**
 * Dados necessários para criar uma nova tarefa
 */
export interface CreateTask {
  /** Título da tarefa (obrigatório, max 255 caracteres) */
  title: string;
  /** Descrição da tarefa (opcional, max 1000 caracteres) */
  description?: string;
  /** Status da tarefa (opcional, default: PENDING) */
  status?: TaskStatus;
  /** Prioridade da tarefa (opcional, default: MEDIUM) */
  priority?: TaskPriority;
  /** Data de vencimento (opcional) */
  dueDate?: Date;
}

/**
 * Dados para atualizar uma tarefa existente
 */
export interface UpdateTask {
  /** Título da tarefa */
  title?: string;
  /** Descrição da tarefa */
  description?: string | null;
  /** Status da tarefa */
  status?: TaskStatus;
  /** Prioridade da tarefa */
  priority?: TaskPriority;
  /** Data de vencimento */
  dueDate?: Date | null;
}
