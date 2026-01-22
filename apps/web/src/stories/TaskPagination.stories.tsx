import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { TaskPagination } from '@/components/tasks/task-pagination';

/**
 * O componente TaskPagination exibe controles de paginação para a lista de tarefas.
 * Inclui botões Previous/Next, números de página e informação sobre itens exibidos.
 */
const meta: Meta<typeof TaskPagination> = {
  title: 'Tasks/TaskPagination',
  component: TaskPagination,
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
function TaskPaginationInteractive(props: {
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(props.initialPage ?? 1);

  return (
    <div className="space-y-4">
      <TaskPagination
        currentPage={currentPage}
        totalPages={props.totalPages}
        totalItems={props.totalItems}
        itemsPerPage={props.itemsPerPage ?? 10}
        onPageChange={setCurrentPage}
      />
      <div className="p-4 bg-muted rounded-md text-center">
        <p className="text-sm font-medium">Página atual: {currentPage}</p>
      </div>
    </div>
  );
}

/** Paginação com poucas páginas */
export const Default: Story = {
  render: () => <TaskPaginationInteractive totalPages={5} totalItems={45} />,
};

/** Paginação com muitas páginas */
export const ManyPages: Story = {
  render: () => <TaskPaginationInteractive totalPages={20} totalItems={200} />,
};

/** Primeira página (Previous desabilitado) */
export const FirstPage: Story = {
  render: () => (
    <TaskPaginationInteractive
      totalPages={10}
      totalItems={100}
      initialPage={1}
    />
  ),
};

/** Última página (Next desabilitado) */
export const LastPage: Story = {
  render: () => (
    <TaskPaginationInteractive
      totalPages={10}
      totalItems={100}
      initialPage={10}
    />
  ),
};

/** Página do meio */
export const MiddlePage: Story = {
  render: () => (
    <TaskPaginationInteractive
      totalPages={20}
      totalItems={200}
      initialPage={10}
    />
  ),
};

/** Apenas uma página (não renderiza) */
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 5,
    onPageChange: () => {},
  },
};

/** Sem informação de total de itens */
export const NoTotalItems: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    onPageChange: () => {},
  },
};

/** Com itemsPerPage customizado */
export const CustomItemsPerPage: Story = {
  render: () => (
    <TaskPaginationInteractive
      totalPages={4}
      totalItems={100}
      itemsPerPage={25}
    />
  ),
};
