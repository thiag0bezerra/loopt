import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import {
  TaskFilters,
  type TaskFilterValues,
} from '@/components/tasks/task-filters';
import { TaskStatus, TaskPriority } from '@loopt/shared';

/**
 * O componente TaskFilters permite filtrar a lista de tarefas.
 * Inclui filtros por status, prioridade, busca com debounce e ordenação.
 */
const meta: Meta<typeof TaskFilters> = {
  title: 'Tasks/TaskFilters',
  component: TaskFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Componente wrapper interativo para os stories */
function TaskFiltersInteractive(props: { initialValues?: TaskFilterValues }) {
  const [values, setValues] = useState<TaskFilterValues>(
    props.initialValues ?? {
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
  );

  return (
    <div className="space-y-4">
      <TaskFilters values={values} onChange={setValues} />
      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm font-medium mb-2">Valores atuais:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/** Filtros com estado padrão */
export const Default: Story = {
  render: () => <TaskFiltersInteractive />,
};

/** Filtros com busca ativa */
export const WithSearch: Story = {
  render: () => (
    <TaskFiltersInteractive
      initialValues={{
        search: 'componente',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }}
    />
  ),
};

/** Filtros com status selecionado */
export const WithStatusFilter: Story = {
  render: () => (
    <TaskFiltersInteractive
      initialValues={{
        status: TaskStatus.PENDING,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }}
    />
  ),
};

/** Filtros com prioridade selecionada */
export const WithPriorityFilter: Story = {
  render: () => (
    <TaskFiltersInteractive
      initialValues={{
        priority: TaskPriority.HIGH,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }}
    />
  ),
};

/** Filtros com ordenação por data de vencimento */
export const SortByDueDate: Story = {
  render: () => (
    <TaskFiltersInteractive
      initialValues={{
        sortBy: 'dueDate',
        sortOrder: 'ASC',
      }}
    />
  ),
};

/** Filtros com múltiplos filtros ativos */
export const MultipleFiltersActive: Story = {
  render: () => (
    <TaskFiltersInteractive
      initialValues={{
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        search: 'bug',
        sortBy: 'priority',
        sortOrder: 'DESC',
      }}
    />
  ),
};
