'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { StatusDistribution } from '@/hooks/use-analytics';

/**
 * Props para o componente StatusPieChart
 */
export interface StatusPieChartProps {
  /** Dados de distribuição por status */
  data: StatusDistribution[];
}

/**
 * Cores para cada status
 */
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', // Amarelo/âmbar para pendente
  in_progress: '#3b82f6', // Azul para em progresso
  completed: '#22c55e', // Verde para concluída
};

/**
 * Labels traduzidos para cada status
 */
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluída',
};

/**
 * Tooltip customizado para o gráfico de pizza
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { percent: number };
  }>;
}) {
  if (active && payload && payload.length > 0) {
    const item = payload[0];
    if (!item) return null;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">
          {STATUS_LABELS[item.name] || item.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {item.value} tarefa{item.value !== 1 ? 's' : ''} (
          {(item.payload.percent * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Gráfico de pizza para distribuição por status
 * @param props - Props do componente
 * @returns Componente StatusPieChart
 */
export function StatusPieChart({ data }: StatusPieChartProps) {
  const router = useRouter();

  /**
   * Handler para drill-down ao clicar em uma fatia
   */
  const handleClick = useCallback(
    (entry: StatusDistribution) => {
      router.push(`/tasks?status=${entry.status}`);
    },
    [router],
  );

  const chartData = data.map((item) => ({
    ...item,
    name: item.status,
    value: item.count,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const chartDataWithPercent = chartData.map((item) => ({
    ...item,
    percent: total > 0 ? item.value / total : 0,
  }));

  if (total === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Nenhuma tarefa encontrada
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartDataWithPercent}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          animationDuration={500}
          animationEasing="ease-out"
          onClick={(_, index) => {
            const item = data[index];
            if (item) handleClick(item);
          }}
          className="cursor-pointer outline-none"
        >
          {chartDataWithPercent.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] || 'hsl(var(--muted))'}
              className="transition-opacity hover:opacity-80"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span className="text-sm">{STATUS_LABELS[value] || value}</span>
          )}
          onClick={(entry) => {
            const item = data.find((d) => d.status === entry.value);
            if (item) handleClick(item);
          }}
          wrapperStyle={{ cursor: 'pointer' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
