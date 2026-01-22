import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskStatus, TaskPriority } from '@loopt/shared';
import type { Tag } from '@/hooks/use-tags';

/**
 * O componente TaskForm é um formulário para criação e edição de tarefas.
 * Inclui campos para título, descrição, status, prioridade, data de vencimento e tags.
 * Utiliza react-hook-form com validação zod para garantir dados corretos.
 */
const meta: Meta<typeof TaskForm> = {
  title: 'Tasks/TaskForm',
  component: TaskForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-120 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Tags de exemplo para os stories */
const sampleTags: Tag[] = [
  {
    id: '1',
    name: 'Frontend',
    color: '#3b82f6',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Backend',
    color: '#10b981',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Urgente',
    color: '#ef4444',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Documentação',
    color: '#8b5cf6',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/** Formulário vazio para criação de nova tarefa */
export const CreateMode: Story = {
  args: {
    submitLabel: 'Criar Tarefa',
    availableTags: sampleTags,
  },
};

/** Formulário com dados preenchidos para edição */
export const EditMode: Story = {
  args: {
    initialData: {
      title: 'Implementar autenticação JWT',
      description:
        'Adicionar sistema de autenticação com tokens JWT, incluindo refresh token e proteção de rotas.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
      tagIds: ['1', '3'],
    },
    submitLabel: 'Salvar Alterações',
    availableTags: sampleTags,
  },
};

/** Formulário em estado de carregamento */
export const Loading: Story = {
  args: {
    isLoading: true,
    submitLabel: 'Salvando...',
    availableTags: sampleTags,
  },
};

/** Formulário com tags carregando */
export const LoadingTags: Story = {
  args: {
    submitLabel: 'Criar Tarefa',
    isLoadingTags: true,
    availableTags: [],
  },
};

/** Formulário sem tags disponíveis */
export const NoTags: Story = {
  args: {
    submitLabel: 'Criar Tarefa',
    availableTags: [],
  },
};

/** Formulário com tarefa concluída */
export const CompletedTask: Story = {
  args: {
    initialData: {
      title: 'Configurar CI/CD',
      description:
        'Configurar pipeline de integração contínua no GitHub Actions.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias no passado
      tagIds: ['2'],
    },
    submitLabel: 'Salvar Alterações',
    availableTags: sampleTags,
  },
};

/** Formulário com muitas tags selecionadas */
export const ManyTagsSelected: Story = {
  args: {
    initialData: {
      title: 'Tarefa com várias categorias',
      description: 'Esta tarefa pertence a múltiplas categorias.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      tagIds: ['1', '2', '3', '4'],
    },
    submitLabel: 'Salvar',
    availableTags: sampleTags,
  },
};
