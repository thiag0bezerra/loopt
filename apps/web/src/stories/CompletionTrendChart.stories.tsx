import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CompletionTrendChart } from '../components/dashboard/completion-trend-chart';
import type { CompletionTrendItem } from '@/hooks/use-analytics';

/**
 * Gráfico de área para tendência de criação e conclusão de tarefas.
 * Suporta componente Brush para zoom/scroll em períodos maiores.
 */
const meta: Meta<typeof CompletionTrendChart> = {
  title: 'Dashboard/CompletionTrendChart',
  component: CompletionTrendChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-150">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Gera dados de tendência para os últimos N dias
 */
function generateTrendData(
  days: number,
  options?: {
    moreCreated?: boolean;
    moreCompleted?: boolean;
    inactive?: boolean;
  },
): CompletionTrendItem[] {
  const data: CompletionTrendItem[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    let created = 0;
    let completed = 0;

    if (!options?.inactive) {
      created = Math.floor(Math.random() * 5) + 1;
      completed = Math.floor(Math.random() * 4);

      if (options?.moreCreated) {
        created += 3;
      }
      if (options?.moreCompleted) {
        completed += 2;
      }
    }

    data.push({ date: dateStr, created, completed });
  }

  return data;
}

/**
 * Tendência dos últimos 7 dias (padrão)
 */
export const SevenDays: Story = {
  args: {
    data: generateTrendData(7),
    showBrush: false,
  },
};

/**
 * Tendência dos últimos 14 dias com Brush
 */
export const FourteenDaysWithBrush: Story = {
  args: {
    data: generateTrendData(14),
    showBrush: true,
  },
};

/**
 * Tendência dos últimos 30 dias com Brush
 */
export const ThirtyDaysWithBrush: Story = {
  args: {
    data: generateTrendData(30),
    showBrush: true,
  },
};

/**
 * Mais tarefas criadas que concluídas
 */
export const MoreCreated: Story = {
  args: {
    data: generateTrendData(7, { moreCreated: true }),
    showBrush: false,
  },
};

/**
 * Alta produtividade (mais concluídas)
 */
export const HighProductivity: Story = {
  args: {
    data: generateTrendData(7, { moreCompleted: true }),
    showBrush: false,
  },
};

/**
 * Sem atividade no período (empty state)
 */
export const NoActivity: Story = {
  args: {
    data: generateTrendData(7, { inactive: true }),
    showBrush: false,
  },
};
