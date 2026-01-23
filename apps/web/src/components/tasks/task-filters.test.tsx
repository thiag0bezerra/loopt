import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  TaskFilters,
  type TaskFilterValues,
} from '@/components/tasks/task-filters';

/**
 * Wrapper com QueryClientProvider para testes
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock do hook useTags
vi.mock('@/hooks/use-tags', () => ({
  useTags: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

describe('TaskFilters', () => {
  const defaultValues: TaskFilterValues = {
    status: undefined,
    priority: undefined,
    tagId: undefined,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  };

  it('deve renderizar todos os filtros', () => {
    const onChange = vi.fn();

    render(<TaskFilters values={defaultValues} onChange={onChange} />, {
      wrapper: createWrapper(),
    });

    // Campo de busca
    expect(
      screen.getByPlaceholderText('Buscar tarefas...'),
    ).toBeInTheDocument();

    // Seletores de ordenação, status e prioridade
    expect(screen.getByText('Data de criação')).toBeInTheDocument();
    expect(screen.getByText('Todos os status')).toBeInTheDocument();
    expect(screen.getByText('Todas as prioridades')).toBeInTheDocument();
  });

  it('deve chamar onChange com search após debounce ao digitar no campo de busca', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TaskFilters values={defaultValues} onChange={onChange} />, {
      wrapper: createWrapper(),
    });

    const searchInput = screen.getByPlaceholderText('Buscar tarefas...');
    await user.type(searchInput, 'teste');

    // Aguardar debounce de 300ms
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'teste',
          }),
        );
      },
      { timeout: 500 },
    );
  });

  it('deve chamar onChange ao alternar ordem de classificação', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TaskFilters values={defaultValues} onChange={onChange} />, {
      wrapper: createWrapper(),
    });

    // Clicar no botão de alternar ordem
    const sortButton = screen.getByRole('button', { name: /ordenar/i });
    await user.click(sortButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sortOrder: 'ASC',
      }),
    );
  });

  it('deve limpar busca ao clicar no botão X', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TaskFilters
        values={{ ...defaultValues, search: 'teste' }}
        onChange={onChange}
      />,
      { wrapper: createWrapper() },
    );

    // Buscar pelo botão de limpar e clicar
    const clearButton = screen.getByRole('button', { name: 'Limpar busca' });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: undefined,
      }),
    );
  });

  it('deve exibir valor inicial de busca', () => {
    const onChange = vi.fn();

    render(
      <TaskFilters
        values={{ ...defaultValues, search: 'valor inicial' }}
        onChange={onChange}
      />,
      { wrapper: createWrapper() },
    );

    const searchInput = screen.getByPlaceholderText('Buscar tarefas...');
    expect(searchInput).toHaveValue('valor inicial');
  });
});
