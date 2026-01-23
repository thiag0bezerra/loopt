import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TagBadge } from '@/components/tasks/tag-badge';

/**
 * O componente TagBadge exibe uma tag com cor de fundo dinâmica e texto com contraste adequado.
 * Opcionalmente pode exibir um botão para remover a tag.
 */
const meta: Meta<typeof TagBadge> = {
  title: 'Tasks/TagBadge',
  component: TagBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onRemove: { action: 'remove' },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Tag azul padrão */
export const Default: Story = {
  args: {
    tag: {
      id: '1',
      name: 'Frontend',
      color: '#3b82f6',
    },
  },
};

/** Tag com cor escura (texto claro) */
export const DarkColor: Story = {
  args: {
    tag: {
      id: '2',
      name: 'Backend',
      color: '#1e40af',
    },
  },
};

/** Tag com cor clara (texto escuro) */
export const LightColor: Story = {
  args: {
    tag: {
      id: '3',
      name: 'Design',
      color: '#fbbf24',
    },
  },
};

/** Tag vermelha para urgência */
export const Urgent: Story = {
  args: {
    tag: {
      id: '4',
      name: 'Urgente',
      color: '#ef4444',
    },
  },
};

/** Tag verde para concluídas */
export const Success: Story = {
  args: {
    tag: {
      id: '5',
      name: 'Concluída',
      color: '#22c55e',
    },
  },
};

/** Tag com botão de remover */
export const Removable: Story = {
  args: {
    tag: {
      id: '6',
      name: 'Removível',
      color: '#6366f1',
    },
    removable: true,
  },
};

/** Tag tamanho médio */
export const MediumSize: Story = {
  args: {
    tag: {
      id: '7',
      name: 'Médio',
      color: '#8b5cf6',
    },
    size: 'md',
  },
};

/** Tag tamanho médio removível */
export const MediumRemovable: Story = {
  args: {
    tag: {
      id: '8',
      name: 'Médio Removível',
      color: '#ec4899',
    },
    size: 'md',
    removable: true,
  },
};

/** Tag com nome longo (truncado) */
export const LongName: Story = {
  args: {
    tag: {
      id: '9',
      name: 'Nome muito longo que deve ser truncado',
      color: '#14b8a6',
    },
  },
};

/** Várias tags lado a lado */
export const MultipleTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <TagBadge tag={{ id: '1', name: 'Frontend', color: '#3b82f6' }} />
      <TagBadge tag={{ id: '2', name: 'Backend', color: '#22c55e' }} />
      <TagBadge tag={{ id: '3', name: 'DevOps', color: '#f97316' }} />
      <TagBadge tag={{ id: '4', name: 'Urgente', color: '#ef4444' }} />
      <TagBadge tag={{ id: '5', name: 'Review', color: '#8b5cf6' }} />
    </div>
  ),
};

/** Tags removíveis lado a lado */
export const MultipleRemovable: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <TagBadge
        tag={{ id: '1', name: 'Frontend', color: '#3b82f6' }}
        removable
        onRemove={(id) => console.log('Remove:', id)}
      />
      <TagBadge
        tag={{ id: '2', name: 'Backend', color: '#22c55e' }}
        removable
        onRemove={(id) => console.log('Remove:', id)}
      />
      <TagBadge
        tag={{ id: '3', name: 'DevOps', color: '#f97316' }}
        removable
        onRemove={(id) => console.log('Remove:', id)}
      />
    </div>
  ),
};
