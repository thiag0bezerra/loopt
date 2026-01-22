'use client';

import * as React from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Mapeamento de status para variantes de badge
 */
const statusVariantMap: Record<
  TaskStatus,
  'secondary' | 'default' | 'outline'
> = {
  [TaskStatus.PENDING]: 'secondary',
  [TaskStatus.IN_PROGRESS]: 'default',
  [TaskStatus.COMPLETED]: 'outline',
};

/**
 * Mapeamento de status para labels em português
 */
const statusLabelMap: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pendente',
  [TaskStatus.IN_PROGRESS]: 'Em Progresso',
  [TaskStatus.COMPLETED]: 'Concluída',
};

/**
 * Mapeamento de prioridade para variantes de badge
 */
const priorityVariantMap: Record<
  TaskPriority,
  'outline' | 'secondary' | 'destructive'
> = {
  [TaskPriority.LOW]: 'outline',
  [TaskPriority.MEDIUM]: 'secondary',
  [TaskPriority.HIGH]: 'destructive',
};

/**
 * Mapeamento de prioridade para labels em português
 */
const priorityLabelMap: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Baixa',
  [TaskPriority.MEDIUM]: 'Média',
  [TaskPriority.HIGH]: 'Alta',
};

/**
 * Props do componente TaskCard
 */
export interface TaskCardProps {
  /** Tarefa a ser exibida */
  task: Task;
  /** Callback ao marcar/desmarcar como concluída */
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  /** Callback ao clicar em editar */
  onEdit?: (taskId: string) => void;
  /** Callback ao clicar em excluir */
  onDelete?: (taskId: string) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Formata a data de vencimento para exibição
 * @param dueDate - Data de vencimento
 * @returns String formatada
 */
function formatDueDate(dueDate: Date | string | null): string | null {
  if (!dueDate) return null;

  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;

  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';

  return format(date, "d 'de' MMM", { locale: ptBR });
}

/**
 * Verifica se a tarefa está atrasada
 * @param task - Tarefa para verificar
 * @returns true se atrasada
 */
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.COMPLETED) return false;
  const date =
    typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate;
  return isPast(date) && !isToday(date);
}

/**
 * Componente de card para exibição de uma tarefa
 *
 * @example
 * ```tsx
 * <TaskCard
 *   task={task}
 *   onToggleComplete={(id, completed) => handleToggle(id, completed)}
 *   onEdit={(id) => openEditModal(id)}
 *   onDelete={(id) => openDeleteDialog(id)}
 * />
 * ```
 */
export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  className,
}: TaskCardProps) {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const overdue = isOverdue(task);
  const dueDateFormatted = formatDueDate(task.dueDate);

  /**
   * Manipula o clique no checkbox
   */
  const handleCheckboxChange = (checked: boolean) => {
    onToggleComplete?.(task.id, checked);
  };

  /**
   * Manipula o clique em editar
   */
  const handleEdit = () => {
    onEdit?.(task.id);
  };

  /**
   * Manipula o clique em excluir
   */
  const handleDelete = () => {
    onDelete?.(task.id);
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isCompleted && 'opacity-60',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Checkbox para marcar como concluída */}
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            aria-label={
              isCompleted ? 'Desmarcar como concluída' : 'Marcar como concluída'
            }
            className="mt-1"
          />

          {/* Título e descrição */}
          <div className="flex-1 min-w-0">
            <CardTitle
              className={cn(
                'text-base line-clamp-1',
                isCompleted && 'line-through text-muted-foreground',
              )}
            >
              {task.title}
            </CardTitle>

            {task.description && (
              <p
                className={cn(
                  'text-sm text-muted-foreground line-clamp-2 mt-1',
                  isCompleted && 'line-through',
                )}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Badge de status */}
          <Badge variant={statusVariantMap[task.status]}>
            {statusLabelMap[task.status]}
          </Badge>

          {/* Badge de prioridade */}
          <Badge variant={priorityVariantMap[task.priority]}>
            {priorityLabelMap[task.priority]}
          </Badge>

          {/* Data de vencimento */}
          {dueDateFormatted && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                overdue
                  ? 'text-destructive font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <Calendar className="h-3 w-3" />
              {dueDateFormatted}
              {overdue && ' (atrasada)'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
