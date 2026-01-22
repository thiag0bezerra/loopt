import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
