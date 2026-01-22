'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from 'recharts';
import type { CompletionTrendItem } from '@/hooks/use-analytics';

/**
 * Props para o componente CompletionTrendChart
 */
export interface CompletionTrendChartProps {
  /** Dados de tendência de conclusão */
  data: CompletionTrendItem[];
  /** Mostrar componente Brush para zoom/scroll (default: false) */
  showBrush?: boolean;
}

/**
 * Formata a data para exibição no eixo X
 * @param dateStr - String de data no formato YYYY-MM-DD
 * @returns Data formatada (DD/MM)
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Tooltip customizado para o gráfico de área
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    const date = new Date(label + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="mb-1 text-sm font-medium capitalize">{formattedDate}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name === 'created' ? 'Criadas' : 'Concluídas'}: {item.value}{' '}
            tarefa{item.value !== 1 ? 's' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Gráfico de área para tendência de conclusão
 * @param props - Props do componente
 * @returns Componente CompletionTrendChart
 */
export function CompletionTrendChart({
  data,
  showBrush = false,
}: CompletionTrendChartProps) {
  const total = data.reduce(
    (sum, item) => sum + item.created + item.completed,
    0,
  );

  if (total === 0) {
    return (
      <div className="flex h-75 items-center justify-center text-muted-foreground">
        Nenhuma atividade no período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--muted-foreground))"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--muted-foreground))"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(142.1 76.2% 36.3%)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="hsl(142.1 76.2% 36.3%)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span className="text-sm">
              {value === 'created' ? 'Criadas' : 'Concluídas'}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="created"
          name="created"
          stroke="hsl(var(--muted-foreground))"
          fillOpacity={1}
          fill="url(#colorCreated)"
          animationDuration={500}
          animationEasing="ease-out"
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="completed"
          stroke="hsl(142.1 76.2% 36.3%)"
          fillOpacity={1}
          fill="url(#colorCompleted)"
          animationDuration={500}
          animationEasing="ease-out"
        />
        {showBrush && (
          <Brush
            dataKey="date"
            height={30}
            stroke="hsl(var(--border))"
            tickFormatter={formatDate}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
