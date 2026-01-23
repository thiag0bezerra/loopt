import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TaskBoard } from '@/components/tasks/task-board';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';

/**
 * O componente TaskBoard exibe as tarefas em um layout Kanban
 * com colunas por status (Pendente, Em Progresso, Concluída).
 * Suporta drag and drop para mover tarefas entre colunas e reordenar.
 */
const meta: Meta<typeof TaskBoard> = {
  title: 'Tasks/TaskBoard',
  component: TaskBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onTaskStatusChange: { action: 'taskStatusChange' },
    onTaskReorder: { action: 'taskReorder' },
  },
  decorators: [
    (Story) => (
      <div className="p-6 h-screen">
        <Story />
      </div>
    ),
  ],
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

/** Tarefas de exemplo para os stories */
const sampleTasks: Task[] = [
  // Pendentes
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
    TaskStatus.PENDING,
    TaskPriority.LOW,
    5,
  ),
  // Em progresso
  createTask(
    '4',
    'Implementar autenticação JWT',
    TaskStatus.IN_PROGRESS,
    TaskPriority.HIGH,
    2,
  ),
  createTask(
    '5',
    'Desenvolver API de tarefas',
    TaskStatus.IN_PROGRESS,
    TaskPriority.MEDIUM,
    4,
  ),
  // Concluídas
  createTask(
    '6',
    'Setup inicial do monorepo',
    TaskStatus.COMPLETED,
    TaskPriority.HIGH,
  ),
  createTask(
    '7',
    'Configurar Docker Compose',
    TaskStatus.COMPLETED,
    TaskPriority.MEDIUM,
  ),
  createTask(
    '8',
    'Criar estrutura de banco de dados',
    TaskStatus.COMPLETED,
    TaskPriority.HIGH,
  ),
];

/** Quadro Kanban com tarefas em todas as colunas */
export const Default: Story = {
  args: {
    tasks: sampleTasks,
    isLoading: false,
  },
};

/** Quadro Kanban em estado de carregamento */
export const Loading: Story = {
  args: {
    tasks: [],
    isLoading: true,
  },
};

/** Quadro Kanban sem tarefas (vazio) */
export const Empty: Story = {
  args: {
    tasks: [],
    isLoading: false,
  },
};

/** Quadro com tarefas apenas pendentes */
export const OnlyPending: Story = {
  args: {
    tasks: sampleTasks.filter((t) => t.status === TaskStatus.PENDING),
    isLoading: false,
  },
};

/** Quadro com tarefas apenas em progresso */
export const OnlyInProgress: Story = {
  args: {
    tasks: sampleTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
    isLoading: false,
  },
};

/** Quadro com tarefas apenas concluídas */
export const OnlyCompleted: Story = {
  args: {
    tasks: sampleTasks.filter((t) => t.status === TaskStatus.COMPLETED),
    isLoading: false,
  },
};

/** Quadro com tarefas de alta prioridade */
export const HighPriorityOnly: Story = {
  args: {
    tasks: sampleTasks.filter((t) => t.priority === TaskPriority.HIGH),
    isLoading: false,
  },
};

/** Quadro com tarefas atrasadas */
export const WithOverdueTasks: Story = {
  args: {
    tasks: [
      ...sampleTasks.slice(0, 3),
      {
        ...createTask(
          '9',
          'Tarefa atrasada urgente',
          TaskStatus.PENDING,
          TaskPriority.HIGH,
        ),
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      },
      {
        ...createTask(
          '10',
          'Outra tarefa atrasada',
          TaskStatus.IN_PROGRESS,
          TaskPriority.MEDIUM,
        ),
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
      },
    ],
    isLoading: false,
  },
};

/** Quadro com tarefas com tags */
export const WithTags: Story = {
  args: {
    tasks: sampleTasks.map((task, index) => ({
      ...task,
      tags:
        index % 2 === 0
          ? [
              { id: 'tag-1', name: 'Frontend', color: '#3b82f6' },
              { id: 'tag-2', name: 'Urgente', color: '#ef4444' },
            ]
          : [{ id: 'tag-3', name: 'Backend', color: '#10b981' }],
    })),
    isLoading: false,
  },
};
