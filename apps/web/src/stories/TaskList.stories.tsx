import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TaskList } from '@/components/tasks/task-list';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';

/**
 * O componente TaskList exibe uma lista de tarefas.
 * Inclui estados de loading com skeleton e empty state quando não há tarefas.
 */
const meta: Meta<typeof TaskList> = {
  title: 'Tasks/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onToggleComplete: { action: 'toggleComplete' },
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
  },
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

/** Lista de tarefas de exemplo */
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Implementar componente de tarefas',
    description:
      'Criar o componente TaskCard com todas as funcionalidades necessárias.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    order: 0,
  },
  {
    id: '2',
    title: 'Revisar pull request',
    description: 'Analisar código e sugerir melhorias no PR #42.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    order: 1,
  },
  {
    id: '3',
    title: 'Configurar ambiente de desenvolvimento',
    description: 'Instalar dependências e configurar variáveis de ambiente.',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
    order: 2,
  },
  {
    id: '4',
    title: 'Corrigir bug crítico',
    description: 'Usuários reportando erro 500 ao salvar formulário.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Atrasada
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    order: 3,
  },
];

/** Lista com várias tarefas */
export const Default: Story = {
  args: {
    tasks: sampleTasks,
    isLoading: false,
  },
};

/** Estado de carregamento com skeletons */
export const Loading: Story = {
  args: {
    tasks: [],
    isLoading: true,
  },
};

/** Estado vazio quando não há tarefas */
export const Empty: Story = {
  args: {
    tasks: [],
    isLoading: false,
  },
};

/** Lista com apenas uma tarefa */
export const SingleTask: Story = {
  args: {
    tasks: sampleTasks.slice(0, 1),
    isLoading: false,
  },
};

/** Lista com muitas tarefas */
export const ManyTasks: Story = {
  args: {
    tasks: [
      ...sampleTasks,
      {
        id: '5',
        title: 'Escrever documentação',
        description: 'Documentar componentes e APIs.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        order: 4,
      },
      {
        id: '6',
        title: 'Reunião de planejamento',
        description: 'Discutir próximas sprints com o time.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dueDate: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        order: 5,
      },
    ],
    isLoading: false,
  },
};
