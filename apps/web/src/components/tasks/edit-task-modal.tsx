'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { TaskForm, type TaskFormValues } from './task-form';
import { useTask, useUpdateTask } from '@/hooks/use-tasks';
import { useTags } from '@/hooks/use-tags';

/**
 * Props do componente EditTaskModal
 */
export interface EditTaskModalProps {
  /** ID da tarefa a ser editada */
  taskId: string | null;
  /** Controla se o modal está aberto */
  open: boolean;
  /** Callback chamado quando o estado de abertura muda */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para edição de uma tarefa existente
 *
 * Busca os dados da tarefa via useTask e utiliza o TaskForm
 * para permitir a edição. Persiste as alterações via useUpdateTask.
 *
 * @example
 * ```tsx
 * const [editModalOpen, setEditModalOpen] = useState(false);
 * const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
 *
 * <EditTaskModal
 *   taskId={selectedTaskId}
 *   open={editModalOpen}
 *   onOpenChange={setEditModalOpen}
 * />
 * ```
 */
export function EditTaskModal({
  taskId,
  open,
  onOpenChange,
}: EditTaskModalProps) {
  const { data: task, isLoading: isLoadingTask } = useTask(taskId);
  const updateTask = useUpdateTask();
  const { data: tags = [], isLoading: isLoadingTags } = useTags();

  /**
   * Manipula o envio do formulário de edição
   * @param data - Dados do formulário validados
   */
  const handleSubmit = async (data: TaskFormValues) => {
    if (!taskId) return;

    await updateTask.mutateAsync({
      id: taskId,
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate?.toISOString() ?? null,
        tagIds: data.tagIds,
      },
    });

    // Fecha o modal após sucesso
    onOpenChange(false);
  };

  /**
   * Renderiza skeleton de carregamento enquanto busca a tarefa
   */
  const renderLoadingState = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Atualize os campos abaixo para modificar a tarefa.
          </DialogDescription>
        </DialogHeader>

        {isLoadingTask ? (
          renderLoadingState()
        ) : task ? (
          <TaskForm
            initialData={{
              title: task.title,
              description: task.description ?? '',
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              tagIds: task.tags?.map((t) => t.id) ?? [],
            }}
            onSubmit={handleSubmit}
            isLoading={updateTask.isPending}
            submitLabel="Salvar Alterações"
            availableTags={tags}
            isLoadingTags={isLoadingTags}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Tarefa não encontrada.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
