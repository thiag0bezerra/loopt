'use client';

import * as React from 'react';
import { ClipboardList } from 'lucide-react';
import type { Task } from '@loopt/shared';
import { cn } from '@workspace/ui/lib/utils';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { TaskCard } from './task-card';

/**
 * Props do componente TaskList
 */
export interface TaskListProps {
  /** Lista de tarefas para exibir */
  tasks: Task[];
  /** Se está carregando */
  isLoading?: boolean;
  /** Callback ao marcar/desmarcar tarefa como concluída */
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  /** Callback ao clicar em editar */
  onEdit?: (taskId: string) => void;
  /** Callback ao clicar em excluir */
  onDelete?: (taskId: string) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente de loading skeleton para a lista de tarefas
 */
function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente de empty state quando não há tarefas
 */
function TaskListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground">
        Nenhuma tarefa encontrada
      </h3>
      <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
        Crie uma nova tarefa clicando no botão acima ou ajuste os filtros de
        busca.
      </p>
    </div>
  );
}

/**
 * Componente de lista de tarefas
 *
 * Exibe uma lista de TaskCards com estados de loading e empty state.
 *
 * @example
 * ```tsx
 * <TaskList
 *   tasks={tasks}
 *   isLoading={isLoading}
 *   onToggleComplete={(id, completed) => handleToggle(id, completed)}
 *   onEdit={(id) => openEditModal(id)}
 *   onDelete={(id) => openDeleteDialog(id)}
 * />
 * ```
 */
export function TaskList({
  tasks,
  isLoading = false,
  onToggleComplete,
  onEdit,
  onDelete,
  className,
}: TaskListProps) {
  // Exibe skeleton durante o carregamento
  if (isLoading) {
    return <TaskListSkeleton />;
  }

  // Exibe empty state quando não há tarefas
  if (tasks.length === 0) {
    return <TaskListEmpty />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

/**
 * Exporta subcomponentes para uso isolado
 */
TaskList.Skeleton = TaskListSkeleton;
TaskList.Empty = TaskListEmpty;
