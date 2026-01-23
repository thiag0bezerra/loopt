'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';
import { cn } from '@workspace/ui/lib/utils';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { CheckCircle, Clock, Loader2, ListTodo } from 'lucide-react';

/**
 * Configuração das colunas do Kanban
 */
const COLUMNS: {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  badgeVariant: 'secondary' | 'default' | 'outline';
}[] = [
  {
    id: TaskStatus.PENDING,
    title: 'Pendente',
    icon: ListTodo,
    badgeVariant: 'secondary',
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: 'Em Progresso',
    icon: Loader2,
    badgeVariant: 'default',
  },
  {
    id: TaskStatus.COMPLETED,
    title: 'Concluída',
    icon: CheckCircle,
    badgeVariant: 'outline',
  },
];

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
 * Props do componente TaskBoard
 */
export interface TaskBoardProps {
  /** Tarefas a serem exibidas */
  tasks: Task[];
  /** Callback ao mover tarefa entre colunas (atualiza status) */
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  /** Callback ao reordenar tarefas */
  onTaskReorder?: (tasks: { id: string; order: number }[]) => void;
  /** Se está carregando */
  isLoading?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Props para o item sortable do Kanban
 */
interface SortableTaskItemProps {
  /** Tarefa a ser exibida */
  task: Task;
  /** Se a tarefa está sendo arrastada */
  isDragging?: boolean;
}

/**
 * Componente de item sortable para o Kanban
 */
function SortableTaskItem({ task, isDragging }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskBoardItem task={task} isDragging={isDragging} />
    </div>
  );
}

/**
 * Props do item visual do Kanban
 */
interface TaskBoardItemProps {
  /** Tarefa a ser exibida */
  task: Task;
  /** Se a tarefa está sendo arrastada */
  isDragging?: boolean;
}

/**
 * Componente visual de item do Kanban (card da tarefa)
 */
function TaskBoardItem({ task, isDragging }: TaskBoardItemProps) {
  const isOverdue =
    task.dueDate &&
    task.status !== TaskStatus.COMPLETED &&
    new Date(task.dueDate) < new Date();

  return (
    <Card
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'rotate-3 shadow-lg ring-2 ring-primary',
        task.status === TaskStatus.COMPLETED && 'opacity-60',
      )}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Título */}
          <h4
            className={cn(
              'font-medium text-sm line-clamp-2',
              task.status === TaskStatus.COMPLETED &&
                'line-through text-muted-foreground',
            )}
          >
            {task.title}
          </h4>

          {/* Descrição (truncada) */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Badges de prioridade e data */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={priorityVariantMap[task.priority]} className="h-5">
              {priorityLabelMap[task.priority]}
            </Badge>

            {task.dueDate && (
              <Badge
                variant={isOverdue ? 'destructive' : 'outline'}
                className="h-5"
              >
                <Clock className="h-3 w-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Props da coluna do Kanban
 */
interface KanbanColumnProps {
  /** ID da coluna (status) */
  id: TaskStatus;
  /** Título da coluna */
  title: string;
  /** Ícone da coluna */
  icon: React.ElementType;
  /** Variante do badge */
  badgeVariant: 'secondary' | 'default' | 'outline';
  /** Tarefas da coluna */
  tasks: Task[];
  /** Se está carregando */
  isLoading?: boolean;
}

/**
 * Componente de coluna do Kanban
 */
function KanbanColumn({
  title,
  icon: Icon,
  badgeVariant,
  tasks,
  isLoading,
}: KanbanColumnProps) {
  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="flex flex-col bg-muted/50 rounded-lg min-w-70 max-w-80 w-full">
      {/* Header da coluna */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <Badge variant={badgeVariant} className="h-5 min-w-5 justify-center">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Conteúdo da coluna */}
      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} />
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de quadro Kanban para visualização de tarefas
 *
 * @example
 * ```tsx
 * <TaskBoard
 *   tasks={tasks}
 *   onTaskStatusChange={(taskId, newStatus) => updateTask(taskId, { status: newStatus })}
 *   onTaskReorder={(updates) => reorderTasks(updates)}
 * />
 * ```
 */
export function TaskBoard({
  tasks,
  onTaskStatusChange,
  onTaskReorder,
  isLoading,
  className,
}: TaskBoardProps) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [localTasks, setLocalTasks] = React.useState<Task[]>(tasks);

  // Sincroniza tarefas locais com props
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Configura sensores de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Agrupa tarefas por status
  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.PENDING]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.COMPLETED]: [],
    };

    for (const task of localTasks) {
      grouped[task.status].push(task);
    }

    return grouped;
  }, [localTasks]);

  // Encontra a tarefa sendo arrastada
  const activeTask = React.useMemo(() => {
    if (!activeId) return null;
    return localTasks.find((task) => task.id === activeId) ?? null;
  }, [activeId, localTasks]);

  /**
   * Encontra o status da coluna de um item
   */
  const findColumnStatus = (id: UniqueIdentifier): TaskStatus | null => {
    // Se é um ID de coluna direto
    if (Object.values(TaskStatus).includes(id as TaskStatus)) {
      return id as TaskStatus;
    }

    // Procura a tarefa pelo ID
    const task = localTasks.find((t) => t.id === id);
    return task?.status ?? null;
  };

  /**
   * Manipula o início do drag
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  /**
   * Manipula o drag sobre outro item/coluna
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeStatus = findColumnStatus(active.id);
    const overStatus = findColumnStatus(over.id);

    if (!activeStatus || !overStatus || activeStatus === overStatus) return;

    // Move a tarefa para a nova coluna
    setLocalTasks((prev) =>
      prev.map((task) =>
        task.id === active.id ? { ...task, status: overStatus } : task,
      ),
    );
  };

  /**
   * Manipula o fim do drag
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeTask = localTasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const activeStatus = activeTask.status;
    const overStatus = findColumnStatus(over.id);

    if (!overStatus) return;

    // Se mudou de coluna, notifica a mudança de status
    if (activeStatus !== overStatus) {
      onTaskStatusChange?.(String(active.id), overStatus);
    }

    // Se está na mesma coluna, pode ser reordenação
    if (activeStatus === overStatus && active.id !== over.id) {
      const tasksInColumn = tasksByStatus[activeStatus];
      const oldIndex = tasksInColumn.findIndex((t) => t.id === active.id);
      const overTask = localTasks.find((t) => t.id === over.id);

      if (overTask && overTask.status === activeStatus) {
        const newIndex = tasksInColumn.findIndex((t) => t.id === over.id);
        const reorderedTasks = arrayMove(tasksInColumn, oldIndex, newIndex);

        // Notifica a reordenação
        onTaskReorder?.(
          reorderedTasks.map((task, index) => ({
            id: task.id,
            order: index,
          })),
        );
      }
    }
  };

  /**
   * Manipula cancelamento do drag
   */
  const handleDragCancel = () => {
    setActiveId(null);
    // Restaura as tarefas originais
    setLocalTasks(tasks);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            badgeVariant={column.badgeVariant}
            tasks={tasksByStatus[column.id]}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Overlay durante o drag */}
      <DragOverlay>
        {activeTask ? <TaskBoardItem task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
