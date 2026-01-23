import { Flame, Clock, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import type { ProductivityMetrics } from '@/hooks/use-analytics';

/**
 * Props para o componente ProductivityInsights
 */
export interface ProductivityInsightsProps {
  /** Dados de métricas de produtividade */
  data: ProductivityMetrics;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Tradução dos dias da semana
 */
const DAY_TRANSLATIONS: Record<string, string> = {
  Sunday: 'Domingo',
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
  Saturday: 'Sábado',
};

/**
 * Formata o tempo médio de conclusão
 * @param hours - Tempo em horas
 * @returns Tempo formatado
 */
function formatCompletionTime(hours: number): string {
  if (hours === 0) return 'N/A';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)} horas`;
  }
  const days = Math.round(hours / 24);
  return `${days} dia${days !== 1 ? 's' : ''}`;
}

/**
 * Componente de insights de produtividade
 * @param props - Props do componente
 * @returns Componente ProductivityInsights
 */
export function ProductivityInsights({
  data,
  className,
}: ProductivityInsightsProps) {
  const weekChange = data.weekOverWeekChange;
  const isPositiveChange = weekChange > 0;
  const isNegativeChange = weekChange < 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Insights de Produtividade</CardTitle>
        <CardDescription>
          Suas métricas de desempenho nas tarefas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tempo médio de conclusão */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Tempo médio de conclusão
            </p>
            <p className="text-lg font-semibold">
              {formatCompletionTime(data.averageCompletionTime)}
            </p>
          </div>
        </div>

        {/* Comparação semana a semana */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isPositiveChange && 'bg-green-500/10',
              isNegativeChange && 'bg-red-500/10',
              !isPositiveChange && !isNegativeChange && 'bg-muted',
            )}
          >
            {isPositiveChange ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : isNegativeChange ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Semana atual vs. anterior
            </p>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span>{data.tasksCompletedThisWeek} tarefas</span>
              {weekChange !== 0 && (
                <span
                  className={cn(
                    'text-sm',
                    isPositiveChange && 'text-green-500',
                    isNegativeChange && 'text-red-500',
                  )}
                >
                  ({isPositiveChange ? '+' : ''}
                  {weekChange.toFixed(0)}%)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              data.streakDays > 0 ? 'bg-orange-500/10' : 'bg-muted',
            )}
          >
            <Flame
              className={cn(
                'h-5 w-5',
                data.streakDays > 0
                  ? 'text-orange-500'
                  : 'text-muted-foreground',
              )}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sequência atual</p>
            <p className="text-lg font-semibold">
              {data.streakDays} dia{data.streakDays !== 1 ? 's' : ''}{' '}
              {data.streakDays > 0 && '🔥'}
            </p>
          </div>
        </div>

        {/* Dia mais produtivo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dia mais produtivo</p>
            <p className="text-lg font-semibold">
              {DAY_TRANSLATIONS[data.mostProductiveDay] ||
                data.mostProductiveDay ||
                'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
