import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Props para o componente KPICard
 */
export interface KPICardProps {
  /** Título do KPI */
  title: string;
  /** Valor principal a ser exibido */
  value: string | number;
  /** Ícone do KPI (componente lucide-react) */
  icon: LucideIcon;
  /** Descrição adicional (opcional) */
  description?: string;
  /** Tendência do KPI (opcional) */
  trend?: {
    /** Direção da tendência */
    direction: 'up' | 'down' | 'neutral';
    /** Valor da variação (ex: "+10%") */
    value: string;
  };
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Card de KPI para exibição de métricas no dashboard
 * @param props - Props do componente
 * @returns Componente KPICard
 */
export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  trend.direction === 'up' && 'text-green-500',
                  trend.direction === 'down' && 'text-red-500',
                )}
              >
                {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend.direction === 'down' && (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {description && (
              <span className="truncate hidden xs:inline">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
