'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { TaskStatus } from '@loopt/shared';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import {
  TaskList,
  TaskFilters,
  TaskPagination,
  CreateTaskModal,
  EditTaskModal,
  DeleteConfirmModal,
  type TaskFilterValues,
} from '@/components/tasks';
import {
  useTasks,
  useUpdateTask,
  type TaskFilters as Filters,
} from '@/hooks/use-tasks';
import { useTasksWebsocket } from '@/hooks/use-tasks-websocket';

/**
 * Página principal de gestão de tarefas
 *
 * Permite ao usuário:
 * - Listar tarefas com filtros, ordenação e paginação
 * - Criar novas tarefas via modal
 * - Editar tarefas existentes via modal
 * - Excluir tarefas com confirmação
 * - Marcar tarefas como concluídas via checkbox
 */
export default function TasksPage() {
  // Estados dos filtros
  const [filters, setFilters] = React.useState<TaskFilterValues>({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Estado da paginação
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // Estados dos modais
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null,
  );
  const [selectedTaskTitle, setSelectedTaskTitle] = React.useState<string>('');

  // Conectar websocket para atualizações em tempo real
  useTasksWebsocket();

  // Construir filtros para a API
  const apiFilters: Filters = React.useMemo(() => {
    const result: Filters = {
      page,
      limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.status && filters.status !== 'all') {
      result.status = filters.status as TaskStatus;
    }

    if (filters.priority && filters.priority !== 'all') {
      result.priority = filters.priority;
    }

    if (filters.search?.trim()) {
      result.search = filters.search.trim();
    }

    return result;
  }, [filters, page, limit]);

  // Query de tarefas
  const { data, isLoading } = useTasks(apiFilters);

  // Mutation para atualizar tarefa (checkbox concluída)
  const updateTask = useUpdateTask();

  /**
   * Manipula mudança nos filtros
   * Reseta a página para 1 quando filtros mudam
   */
  const handleFiltersChange = (newFilters: TaskFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  /**
   * Manipula clique para editar tarefa
   */
  const handleEdit = (taskId: string) => {
    setSelectedTaskId(taskId);
    setEditModalOpen(true);
  };

  /**
   * Manipula clique para excluir tarefa
   */
  const handleDelete = (taskId: string) => {
    const task = data?.data.find((t) => t.id === taskId);
    setSelectedTaskId(taskId);
    setSelectedTaskTitle(task?.title ?? '');
    setDeleteModalOpen(true);
  };

  /**
   * Manipula toggle de tarefa concluída
   */
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: {
        status: completed ? TaskStatus.COMPLETED : TaskStatus.PENDING,
      },
    });
  };

  /**
   * Limpa o estado dos modais ao fechar
   */
  const handleEditModalClose = (open: boolean) => {
    setEditModalOpen(open);
    if (!open) {
      setSelectedTaskId(null);
    }
  };

  const handleDeleteModalClose = (open: boolean) => {
    setDeleteModalOpen(open);
    if (!open) {
      setSelectedTaskId(null);
      setSelectedTaskTitle('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe seu progresso.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <Separator />

      {/* Filtros */}
      <TaskFilters values={filters} onChange={handleFiltersChange} />

      {/* Lista de tarefas */}
      <TaskList
        tasks={data?.data ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
      />

      {/* Paginação */}
      {data && data.meta.totalPages > 1 && (
        <TaskPagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          totalItems={data.meta.total}
          onPageChange={setPage}
        />
      )}

      {/* Modais */}
      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <EditTaskModal
        taskId={selectedTaskId}
        open={editModalOpen}
        onOpenChange={handleEditModalClose}
      />

      <DeleteConfirmModal
        taskId={selectedTaskId}
        taskTitle={selectedTaskTitle}
        open={deleteModalOpen}
        onOpenChange={handleDeleteModalClose}
      />
    </div>
  );
}
