'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { useDeleteTask } from '@/hooks/use-tasks';

/**
 * Props do componente DeleteConfirmModal
 */
export interface DeleteConfirmModalProps {
  /** ID da tarefa a ser excluída */
  taskId: string | null;
  /** Título da tarefa (para exibição) */
  taskTitle?: string;
  /** Controla se o modal está aberto */
  open: boolean;
  /** Callback chamado quando o estado de abertura muda */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal de confirmação para exclusão de tarefa
 *
 * Utiliza AlertDialog do shadcn/ui para uma experiência de confirmação
 * acessível. Exibe o título da tarefa e permite cancelar ou confirmar.
 *
 * @example
 * ```tsx
 * const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 * const [taskToDelete, setTaskToDelete] = useState<{id: string, title: string} | null>(null);
 *
 * <DeleteConfirmModal
 *   taskId={taskToDelete?.id ?? null}
 *   taskTitle={taskToDelete?.title}
 *   open={deleteModalOpen}
 *   onOpenChange={setDeleteModalOpen}
 * />
 * ```
 */
export function DeleteConfirmModal({
  taskId,
  taskTitle,
  open,
  onOpenChange,
}: DeleteConfirmModalProps) {
  const deleteTask = useDeleteTask();

  /**
   * Manipula a confirmação de exclusão
   */
  const handleConfirm = async () => {
    if (!taskId) return;

    await deleteTask.mutateAsync(taskId);

    // Fecha o modal após sucesso
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
          <AlertDialogDescription>
            {taskTitle ? (
              <>
                Tem certeza que deseja excluir a tarefa{' '}
                <strong>&quot;{taskTitle}&quot;</strong>? Esta ação não pode ser
                desfeita.
              </>
            ) : (
              'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTask.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteTask.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
