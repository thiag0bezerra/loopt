import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '@/components/ui/badge';

/**
 * O componente Badge é usado para exibir status, categorias ou contagens.
 * Suporta múltiplas variantes visuais.
 */
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'A variante visual do badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Variante padrão do badge */
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

/** Variante secondary */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

/** Variante destructive para alertas */
export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

/** Variante outline com borda */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

/** Badge de status de tarefa - Pendente */
export const StatusPending: Story = {
  args: {
    children: 'Pendente',
    variant: 'secondary',
  },
};

/** Badge de status de tarefa - Em Progresso */
export const StatusInProgress: Story = {
  args: {
    children: 'Em Progresso',
    variant: 'default',
  },
};

/** Badge de status de tarefa - Concluída */
export const StatusCompleted: Story = {
  render: () => (
    <Badge className="bg-green-500 hover:bg-green-500/80">Concluída</Badge>
  ),
};

/** Badge de prioridade - Baixa */
export const PriorityLow: Story = {
  args: {
    children: 'Baixa',
    variant: 'outline',
  },
};

/** Badge de prioridade - Média */
export const PriorityMedium: Story = {
  args: {
    children: 'Média',
    variant: 'secondary',
  },
};

/** Badge de prioridade - Alta */
export const PriorityHigh: Story = {
  args: {
    children: 'Alta',
    variant: 'destructive',
  },
};

/** Todas as variantes lado a lado */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/** Badges de status de tarefa */
export const TaskStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">Pendente</Badge>
      <Badge variant="default">Em Progresso</Badge>
      <Badge className="bg-green-500 hover:bg-green-500/80">Concluída</Badge>
    </div>
  ),
};

/** Badges de prioridade */
export const TaskPriorities: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Baixa</Badge>
      <Badge variant="secondary">Média</Badge>
      <Badge variant="destructive">Alta</Badge>
    </div>
  ),
};
