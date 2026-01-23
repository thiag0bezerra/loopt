import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';

/**
 * O componente TaskCard exibe uma tarefa em formato de card.
 * Inclui checkbox para marcar como concluída, badges de status e prioridade,
 * e um dropdown com opções de editar e excluir.
 */
const meta: Meta<typeof TaskCard> = {
  title: 'Tasks/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onToggleComplete: { action: 'toggleComplete' },
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Tarefa base para os stories */
const baseTask: Task = {
  id: '1',
  title: 'Implementar componente de tarefas',
  description:
    'Criar o componente TaskCard com todas as funcionalidades necessárias.',
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  completedAt: null,
  order: 0,
};

/** Tarefa pendente com prioridade média */
export const Default: Story = {
  args: {
    task: baseTask,
  },
};

/** Tarefa em progresso */
export const InProgress: Story = {
  args: {
    task: {
      ...baseTask,
      id: '2',
      title: 'Revisar pull request',
      description: 'Analisar código e sugerir melhorias no PR #42.',
      status: TaskStatus.IN_PROGRESS,
    },
  },
};

/** Tarefa concluída */
export const Completed: Story = {
  args: {
    task: {
      ...baseTask,
      id: '3',
      title: 'Configurar ambiente de desenvolvimento',
      description: 'Instalar dependências e configurar variáveis de ambiente.',
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
    },
  },
};

/** Tarefa com alta prioridade */
export const HighPriority: Story = {
  args: {
    task: {
      ...baseTask,
      id: '4',
      title: 'Corrigir bug crítico em produção',
      description: 'Usuários estão reportando erro 500 ao salvar formulário.',
      priority: TaskPriority.HIGH,
    },
  },
};

/** Tarefa com baixa prioridade */
export const LowPriority: Story = {
  args: {
    task: {
      ...baseTask,
      id: '5',
      title: 'Atualizar documentação',
      description: 'Revisar README e adicionar exemplos de uso.',
      priority: TaskPriority.LOW,
    },
  },
};

/** Tarefa atrasada */
export const Overdue: Story = {
  args: {
    task: {
      ...baseTask,
      id: '6',
      title: 'Entregar relatório mensal',
      description: 'Compilar métricas e enviar para o time de liderança.',
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias no passado
    },
  },
};

/** Tarefa sem descrição */
export const NoDescription: Story = {
  args: {
    task: {
      ...baseTask,
      id: '7',
      title: 'Tarefa simples sem descrição',
      description: null,
    },
  },
};

/** Tarefa com vencimento hoje */
export const DueToday: Story = {
  args: {
    task: {
      ...baseTask,
      id: '8',
      title: 'Tarefa para hoje',
      description: 'Esta tarefa vence hoje.',
      dueDate: new Date(),
    },
  },
};

/** Tarefa com título longo */
export const LongTitle: Story = {
  args: {
    task: {
      ...baseTask,
      id: '9',
      title:
        'Esta é uma tarefa com um título muito longo que deve ser truncado para não quebrar o layout do card',
      description: 'Descrição da tarefa com título longo.',
    },
  },
};

/** Tarefa sem data de vencimento */
export const NoDueDate: Story = {
  args: {
    task: {
      ...baseTask,
      id: '10',
      title: 'Tarefa sem prazo',
      description: 'Esta tarefa não tem data de vencimento definida.',
      dueDate: null,
    },
  },
};
