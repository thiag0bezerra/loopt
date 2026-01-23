import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ExportButton } from '@/components/tasks/export-button';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';

/**
 * O componente ExportButton permite exportar tarefas para CSV ou PDF.
 * Exibe um dropdown com opções de formato de exportação.
 */
const meta: Meta<typeof ExportButton> = {
  title: 'Tasks/ExportButton',
  component: ExportButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Se o botão está desabilitado',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Gera uma tarefa de exemplo */
const createTask = (
  id: string,
  title: string,
  status: TaskStatus,
  priority: TaskPriority,
  daysUntilDue?: number,
): Task => ({
  id,
  title,
  description: `Descrição da tarefa ${title.toLowerCase()}.`,
  status,
  priority,
  dueDate: daysUntilDue
    ? new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000)
    : null,
  userId: 'user-1',
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
  completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
  order: 0,
  tags: [],
});

/** Tarefas de exemplo */
const sampleTasks: Task[] = [
  createTask(
    '1',
    'Revisar documentação do projeto',
    TaskStatus.PENDING,
    TaskPriority.HIGH,
    1,
  ),
  createTask(
    '2',
    'Configurar ambiente de desenvolvimento',
    TaskStatus.PENDING,
    TaskPriority.MEDIUM,
    3,
  ),
  createTask(
    '3',
    'Criar plano de testes',
    TaskStatus.IN_PROGRESS,
    TaskPriority.LOW,
    5,
  ),
  createTask(
    '4',
    'Implementar autenticação JWT',
    TaskStatus.COMPLETED,
    TaskPriority.HIGH,
  ),
  createTask(
    '5',
    'Desenvolver API de tarefas',
    TaskStatus.COMPLETED,
    TaskPriority.MEDIUM,
  ),
];

/** Botão de exportação com tarefas */
export const Default: Story = {
  args: {
    tasks: sampleTasks,
  },
};

/** Botão de exportação sem tarefas (desabilitado) */
export const Empty: Story = {
  args: {
    tasks: [],
  },
};

/** Botão de exportação desabilitado manualmente */
export const Disabled: Story = {
  args: {
    tasks: sampleTasks,
    disabled: true,
  },
};

/** Botão de exportação com filtros aplicados (para cabeçalho do PDF) */
export const WithFilters: Story = {
  args: {
    tasks: sampleTasks.filter((t) => t.status === TaskStatus.PENDING),
    filters: {
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      search: 'documentação',
    },
  },
};

/** Botão de exportação com apenas tarefas concluídas */
export const CompletedOnly: Story = {
  args: {
    tasks: sampleTasks.filter((t) => t.status === TaskStatus.COMPLETED),
    filters: {
      status: TaskStatus.COMPLETED,
    },
  },
};

/** Botão de exportação com muitas tarefas */
export const ManyTasks: Story = {
  args: {
    tasks: Array.from({ length: 50 }, (_, i) =>
      createTask(
        `task-${i}`,
        `Tarefa ${i + 1} - ${['Desenvolvimento', 'Teste', 'Documentação', 'Deploy'][i % 4]}`,
        [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED][
          i % 3
        ] as TaskStatus,
        [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH][
          i % 3
        ] as TaskPriority,
        i % 2 === 0 ? i + 1 : undefined,
      ),
    ),
  },
};
