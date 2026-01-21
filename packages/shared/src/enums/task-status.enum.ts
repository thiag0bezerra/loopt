/**
 * Status possíveis de uma tarefa
 */
export enum TaskStatus {
  /** Tarefa pendente, ainda não iniciada */
  PENDING = 'pending',
  /** Tarefa em andamento */
  IN_PROGRESS = 'in_progress',
  /** Tarefa concluída */
  COMPLETED = 'completed',
}
