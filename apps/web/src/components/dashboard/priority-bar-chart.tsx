'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PriorityDistribution } from '@/hooks/use-analytics';

/**
 * Props para o componente PriorityBarChart
 */
export interface PriorityBarChartProps {
  /** Dados de distribuição por prioridade */
  data: PriorityDistribution[];
}

/**
 * Cores para cada prioridade
 */
const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e', // Verde para baixa
  medium: '#f59e0b', // Amarelo/âmbar para média
  high: '#ef4444', // Vermelho para alta
};

/**
 * Labels traduzidos para cada prioridade
 */
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

/**
 * Tooltip customizado para o gráfico de barras
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length > 0) {
    const item = payload[0];
    if (!item) return null;
    const value = item.value;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">
          {PRIORITY_LABELS[label || ''] || label}
        </p>
        <p className="text-sm text-muted-foreground">
          {value} tarefa{value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Gráfico de barras para distribuição por prioridade
 * @param props - Props do componente
 * @returns Componente PriorityBarChart
 */
export function PriorityBarChart({ data }: PriorityBarChartProps) {
  const router = useRouter();

  /**
   * Handler para drill-down ao clicar em uma barra
   */
  const handleClick = useCallback(
    (entry: PriorityDistribution) => {
      router.push(`/tasks?priority=${entry.priority}`);
    },
    [router],
  );

  /** Ordenar prioridades na ordem correta */
  const orderedData = ['low', 'medium', 'high']
    .map((priority) => data.find((d) => d.priority === priority))
    .filter((d): d is PriorityDistribution => d !== undefined)
    .map((item) => ({
      ...item,
      name: PRIORITY_LABELS[item.priority] || item.priority,
    }));

  const total = orderedData.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-75 items-center justify-center text-muted-foreground">
        Nenhuma tarefa encontrada
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={orderedData} layout="vertical">
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={80}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          radius={[0, 4, 4, 0]}
          animationDuration={500}
          animationEasing="ease-out"
          onClick={(_, index) => {
            const item = orderedData[index];
            if (item) handleClick(item);
          }}
          className="cursor-pointer"
        >
          {orderedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PRIORITY_COLORS[entry.priority] || 'hsl(var(--muted))'}
              className="transition-opacity hover:opacity-80"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
