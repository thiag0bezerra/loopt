import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ListTodo, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { KPICard } from '../components/dashboard/kpi-card';

/**
 * Componente KPICard para exibição de métricas no dashboard.
 * Suporta tendências (up/down) e descrições adicionais.
 */
const meta: Meta<typeof KPICard> = {
  title: 'Dashboard/KPICard',
  component: KPICard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'Ícone lucide-react',
    },
    trend: {
      control: 'object',
      description: 'Tendência do KPI',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-62.5">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * KPI Card básico com valor numérico
 */
export const Default: Story = {
  args: {
    title: 'Total de Tarefas',
    value: 42,
    icon: ListTodo,
    description: 'tarefas cadastradas',
  },
};

/**
 * KPI Card com tendência positiva
 */
export const UpTrend: Story = {
  args: {
    title: 'Taxa de Conclusão',
    value: '75%',
    icon: CheckCircle2,
    description: '30 concluídas',
    trend: {
      direction: 'up',
      value: '+15%',
    },
  },
};

/**
 * KPI Card com tendência negativa
 */
export const DownTrend: Story = {
  args: {
    title: 'Tarefas Atrasadas',
    value: 5,
    icon: AlertTriangle,
    description: 'precisam de atenção',
    trend: {
      direction: 'down',
      value: '3 novas',
    },
  },
};

/**
 * KPI Card neutro (sem tendência)
 */
export const Neutral: Story = {
  args: {
    title: 'Vencem em Breve',
    value: 8,
    icon: Clock,
    description: 'nos próximos 3 dias',
  },
};

/**
 * KPI Card com valor em texto
 */
export const TextValue: Story = {
  args: {
    title: 'Tempo Médio',
    value: '2.5 horas',
    icon: Clock,
    description: 'para conclusão',
  },
};

/**
 * Grid de KPIs (exemplo de uso em conjunto)
 */
export const Grid: Story = {
  render: () => (
    <div className="grid w-[800px] gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Tarefas"
        value={42}
        icon={ListTodo}
        description="tarefas cadastradas"
      />
      <KPICard
        title="Taxa de Conclusão"
        value="75%"
        icon={CheckCircle2}
        description="30 concluídas"
        trend={{ direction: 'up', value: '+15%' }}
      />
      <KPICard
        title="Tarefas Atrasadas"
        value={5}
        icon={AlertTriangle}
        description="precisam de atenção"
        trend={{ direction: 'down', value: '3 novas' }}
      />
      <KPICard
        title="Vencem em Breve"
        value={8}
        icon={Clock}
        description="nos próximos 3 dias"
      />
    </div>
  ),
};
