'use client';

import * as React from 'react';
import { TaskStatus } from '@loopt/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { TaskForm, type TaskFormValues } from './task-form';
import { useCreateTask } from '@/hooks/use-tasks';
import { useTags } from '@/hooks/use-tags';

/**
 * Props do componente CreateTaskModal
 */
export interface CreateTaskModalProps {
  /** Controla se o modal está aberto */
  open: boolean;
  /** Callback chamado quando o estado de abertura muda */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para criação de uma nova tarefa
 *
 * Utiliza o TaskForm para capturar os dados e o hook useCreateTask
 * para persistir a tarefa via API.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Button onClick={() => setOpen(true)}>Nova Tarefa</Button>
 * <CreateTaskModal open={open} onOpenChange={setOpen} />
 * ```
 */
export function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const createTask = useCreateTask();
  const { data: tags = [], isLoading: isLoadingTags } = useTags();

  /**
   * Manipula o envio do formulário de criação
   * @param data - Dados do formulário validados
   */
  const handleSubmit = async (data: TaskFormValues) => {
    await createTask.mutateAsync({
      title: data.title,
      description: data.description || undefined,
      status: data.status ?? TaskStatus.PENDING,
      priority: data.priority,
      dueDate: data.dueDate?.toISOString(),
      tagIds: data.tagIds,
    });

    // Fecha o modal após sucesso
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar uma nova tarefa.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          isLoading={createTask.isPending}
          submitLabel="Criar Tarefa"
          availableTags={tags}
          isLoadingTags={isLoadingTags}
        />
      </DialogContent>
    </Dialog>
  );
}
