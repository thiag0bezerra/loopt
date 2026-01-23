import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';

/**
 * Mock base de uma tarefa para os testes
 */
const mockTask: Task = {
  id: 'task-uuid-123',
  title: 'Tarefa de Teste',
  description: 'Descrição da tarefa de teste',
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  userId: 'user-uuid-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  completedAt: null,
  order: 0,
};

describe('TaskCard', () => {
  it('deve renderizar título corretamente', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Tarefa de Teste')).toBeInTheDocument();
  });

  it('deve renderizar descrição quando fornecida', () => {
    render(<TaskCard task={mockTask} />);

    expect(
      screen.getByText('Descrição da tarefa de teste'),
    ).toBeInTheDocument();
  });

  it('deve renderizar badge de status Pendente corretamente', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve renderizar badge de status Em Progresso corretamente', () => {
    const taskInProgress: Task = {
      ...mockTask,
      status: TaskStatus.IN_PROGRESS,
    };

    render(<TaskCard task={taskInProgress} />);

    expect(screen.getByText('Em Progresso')).toBeInTheDocument();
  });

  it('deve renderizar badge de status Concluída corretamente', () => {
    const completedTask: Task = {
      ...mockTask,
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
    };

    render(<TaskCard task={completedTask} />);

    expect(screen.getByText('Concluída')).toBeInTheDocument();
  });

  it('deve renderizar badge de prioridade Média corretamente', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Média')).toBeInTheDocument();
  });

  it('deve renderizar badge de prioridade Alta com estilo destructive', () => {
    const highPriorityTask: Task = {
      ...mockTask,
      priority: TaskPriority.HIGH,
    };

    render(<TaskCard task={highPriorityTask} />);

    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('deve renderizar badge de prioridade Baixa corretamente', () => {
    const lowPriorityTask: Task = {
      ...mockTask,
      priority: TaskPriority.LOW,
    };

    render(<TaskCard task={lowPriorityTask} />);

    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('deve chamar onToggleComplete quando checkbox é clicado', async () => {
    const user = userEvent.setup();
    const onToggleComplete = vi.fn();

    render(<TaskCard task={mockTask} onToggleComplete={onToggleComplete} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onToggleComplete).toHaveBeenCalledWith('task-uuid-123', true);
  });

  it('deve exibir checkbox marcado quando tarefa está concluída', () => {
    const completedTask: Task = {
      ...mockTask,
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
    };

    render(<TaskCard task={completedTask} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('deve exibir checkbox desmarcado quando tarefa está pendente', () => {
    render(<TaskCard task={mockTask} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
