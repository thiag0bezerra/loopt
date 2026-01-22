import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PriorityBarChart } from '../components/dashboard/priority-bar-chart';

/**
 * Gráfico de barras para distribuição de tarefas por prioridade.
 * Clicável para drill-down (navega para /tasks?priority=X).
 */
const meta: Meta<typeof PriorityBarChart> = {
  title: 'Dashboard/PriorityBarChart',
  component: PriorityBarChart,
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
 * Distribuição equilibrada de prioridades
 */
export const Balanced: Story = {
  args: {
    data: [
      { priority: 'low', count: 8 },
      { priority: 'medium', count: 12 },
      { priority: 'high', count: 5 },
    ],
  },
};

/**
 * Maioria de tarefas com alta prioridade
 */
export const MostlyHigh: Story = {
  args: {
    data: [
      { priority: 'low', count: 2 },
      { priority: 'medium', count: 5 },
      { priority: 'high', count: 20 },
    ],
  },
};

/**
 * Maioria de tarefas com baixa prioridade
 */
export const MostlyLow: Story = {
  args: {
    data: [
      { priority: 'low', count: 25 },
      { priority: 'medium', count: 8 },
      { priority: 'high', count: 2 },
    ],
  },
};

/**
 * Sem tarefas (empty state)
 */
export const Empty: Story = {
  args: {
    data: [
      { priority: 'low', count: 0 },
      { priority: 'medium', count: 0 },
      { priority: 'high', count: 0 },
    ],
  },
};

/**
 * Apenas prioridade média
 */
export const SinglePriority: Story = {
  args: {
    data: [
      { priority: 'low', count: 0 },
      { priority: 'medium', count: 15 },
      { priority: 'high', count: 0 },
    ],
  },
};
