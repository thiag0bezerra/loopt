'use client';

import * as React from 'react';
import { Plus, LayoutList, LayoutGrid, Tags } from 'lucide-react';
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
  TaskBoard,
  ExportButton,
  TagManager,
  type TaskFilterValues,
} from '@/components/tasks';
import {
  useTasks,
  useUpdateTask,
  useReorderTasks,
  type TaskFilters as Filters,
} from '@/hooks/use-tasks';
import { useTasksWebsocket } from '@/hooks/use-tasks-websocket';
import { cn } from '@workspace/ui/lib/utils';

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
    tagId: 'all',
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
  const [tagManagerOpen, setTagManagerOpen] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null,
  );
  const [selectedTaskTitle, setSelectedTaskTitle] = React.useState<string>('');

  // Estado da visualização (lista ou kanban)
  const [viewMode, setViewMode] = React.useState<'list' | 'kanban'>('list');

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

    // Filtro por tag
    if (filters.tagId && filters.tagId !== 'all') {
      result.tagId = filters.tagId;
    }

    return result;
  }, [filters, page, limit]);

  // Query de tarefas
  const { data, isLoading } = useTasks(apiFilters);

  // Mutation para atualizar tarefa (checkbox concluída)
  const updateTask = useUpdateTask();

  // Mutation para reordenar tarefas (drag & drop no Kanban)
  const reorderTasks = useReorderTasks();

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

  /**
   * Manipula reordenação de tarefas no TaskBoard
   */
  const handleTaskReorder = async (tasks: { id: string; order: number }[]) => {
    await reorderTasks.mutateAsync(tasks);
  };

  /**
   * Manipula mudança de status de uma tarefa no TaskBoard (drag & drop entre colunas)
   */
  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: TaskStatus,
  ) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { status: newStatus },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - mobile-first com botão sticky em mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Minhas Tarefas
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas tarefas e acompanhe seu progresso.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle de visualização (Lista/Kanban) */}
          <div className="hidden sm:flex items-center rounded-lg border bg-muted/50 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                'h-8 px-3',
                viewMode === 'list' && 'bg-background shadow-sm',
              )}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={cn(
                'h-8 px-3',
                viewMode === 'kanban' && 'bg-background shadow-sm',
              )}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>

          {/* Botão de gerenciar tags */}
          <Button
            variant="outline"
            onClick={() => setTagManagerOpen(true)}
            className="h-10"
          >
            <Tags className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tags</span>
          </Button>

          {/* Botão de exportar */}
          <ExportButton
            tasks={data?.data ?? []}
            filters={{
              status:
                filters.status !== 'all'
                  ? (filters.status as TaskStatus)
                  : undefined,
              priority:
                filters.priority !== 'all' ? filters.priority : undefined,
              search: filters.search || undefined,
            }}
            disabled={!data?.data?.length}
          />

          {/* Botão de nova tarefa */}
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="h-11 w-full sm:h-10 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filtros */}
      <TaskFilters values={filters} onChange={handleFiltersChange} />

      {/* Lista ou Kanban de tarefas */}
      {viewMode === 'list' ? (
        <>
          <TaskList
            tasks={data?.data ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />

          {/* Paginação - apenas no modo lista */}
          {data && data.meta.totalPages > 1 && (
            <TaskPagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              totalItems={data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <TaskBoard
          tasks={data?.data ?? []}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskReorder={handleTaskReorder}
          isLoading={isLoading}
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

      <TagManager open={tagManagerOpen} onOpenChange={setTagManagerOpen} />
    </div>
  );
}
