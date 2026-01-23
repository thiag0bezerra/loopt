import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TagManager } from '@/components/tasks/tag-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

// Mock do QueryClient para Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Decorator para prover QueryClient
 */
function QueryDecorator(Story: React.ComponentType) {
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
}

/**
 * O componente TagManager permite criar, editar e deletar tags do usuário.
 * Exibe um modal com lista de tags e opções de gerenciamento.
 */
const meta: Meta<typeof TagManager> = {
  title: 'Tasks/TagManager',
  component: TagManager,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [QueryDecorator],
  argTypes: {
    onOpenChange: { action: 'openChange' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** TagManager com trigger padrão */
export const Default: Story = {
  args: {
    showTrigger: true,
  },
};

/** TagManager com dialog aberto por padrão */
export const OpenByDefault: Story = {
  args: {
    showTrigger: true,
    open: true,
  },
};

/** TagManager com trigger customizado */
export const CustomTrigger: Story = {
  args: {
    showTrigger: true,
    trigger: (
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Gerenciar Minhas Tags
      </button>
    ),
  },
};

/**
 * Nota: As funcionalidades completas do TagManager (criar, editar, deletar)
 * requerem uma API backend funcional. Em produção, o componente interage
 * com os endpoints /tags para gerenciar as tags do usuário.
 *
 * No Storybook, você pode visualizar a estrutura do componente,
 * mas as operações CRUD não persistirão sem o backend.
 */
