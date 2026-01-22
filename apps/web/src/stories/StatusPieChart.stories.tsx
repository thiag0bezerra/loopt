import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusPieChart } from '../components/dashboard/status-pie-chart';

/**
 * Gráfico de pizza para distribuição de tarefas por status.
 * Clicável para drill-down (navega para /tasks?status=X).
 */
const meta: Meta<typeof StatusPieChart> = {
  title: 'Dashboard/StatusPieChart',
  component: StatusPieChart,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Distribuição equilibrada de tarefas
 */
export const Balanced: Story = {
  args: {
    data: [
      { status: 'pending', count: 10 },
      { status: 'in_progress', count: 8 },
      { status: 'completed', count: 12 },
    ],
  },
};

/**
 * Maioria de tarefas pendentes
 */
export const MostlyPending: Story = {
  args: {
    data: [
      { status: 'pending', count: 25 },
      { status: 'in_progress', count: 5 },
      { status: 'completed', count: 3 },
    ],
  },
};

/**
 * Maioria de tarefas concluídas
 */
export const MostlyCompleted: Story = {
  args: {
    data: [
      { status: 'pending', count: 2 },
      { status: 'in_progress', count: 3 },
      { status: 'completed', count: 30 },
    ],
  },
};

/**
 * Sem tarefas (empty state)
 */
export const Empty: Story = {
  args: {
    data: [
      { status: 'pending', count: 0 },
      { status: 'in_progress', count: 0 },
      { status: 'completed', count: 0 },
    ],
  },
};

/**
 * Apenas um status com tarefas
 */
export const SingleStatus: Story = {
  args: {
    data: [
      { status: 'pending', count: 0 },
      { status: 'in_progress', count: 15 },
      { status: 'completed', count: 0 },
    ],
  },
};
