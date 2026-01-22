/**
 * Interface que define o payload de uma notificação de tarefa
 */
export interface TaskNotificationPayload {
  /** ID da tarefa */
  taskId: string;

  /** Título da tarefa */
  taskTitle: string;

  /** ID do usuário proprietário */
  userId: string;

  /** Email do usuário */
  userEmail: string;

  /** Nome do usuário */
  userName: string;

  /** Data de criação da tarefa */
  createdAt: Date;
}
