import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChartCard } from '../components/dashboard/chart-card';

/**
 * Componente ChartCard para exibição de gráficos no dashboard.
 * Wrapper simples que adiciona título e descrição ao gráfico.
 */
const meta: Meta<typeof ChartCard> = {
  title: 'Dashboard/ChartCard',
  component: ChartCard,
  parameters: {
    layout: 'centered',
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
 * ChartCard básico com conteúdo placeholder
 */
export const Default: Story = {
  args: {
    title: 'Distribuição por Status',
    description: 'Visualize suas tarefas por status',
    children: (
      <div className="flex h-[200px] items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Área do Gráfico
      </div>
    ),
  },
};

/**
 * ChartCard sem descrição
 */
export const NoDescription: Story = {
  args: {
    title: 'Por Prioridade',
    children: (
      <div className="flex h-[200px] items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Área do Gráfico
      </div>
    ),
  },
};

/**
 * ChartCard com conteúdo de altura variável
 */
export const TallContent: Story = {
  args: {
    title: 'Tendência de Conclusão',
    description: 'Últimos 7 dias',
    children: (
      <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Gráfico de Área
      </div>
    ),
  },
};
