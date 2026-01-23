/**
 * Componentes de tarefas
 * @module components/tasks
 */

export { TaskCard, type TaskCardProps } from './task-card';
export { TaskList, type TaskListProps } from './task-list';
export {
  TaskFilters,
  type TaskFiltersProps,
  type TaskFilterValues,
} from './task-filters';
export { TaskPagination, type TaskPaginationProps } from './task-pagination';
export { TaskForm, type TaskFormProps, type TaskFormValues } from './task-form';
export {
  CreateTaskModal,
  type CreateTaskModalProps,
} from './create-task-modal';
export { EditTaskModal, type EditTaskModalProps } from './edit-task-modal';
export {
  DeleteConfirmModal,
  type DeleteConfirmModalProps,
} from './delete-confirm-modal';
export { TagBadge, type TagBadgeProps, type TagBadgeTag } from './tag-badge';
export { TagManager, type TagManagerProps } from './tag-manager';
