import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Props para o componente ChartCard
 */
export interface ChartCardProps {
  /** Título do gráfico */
  title: string;
  /** Descrição do gráfico (opcional) */
  description?: string;
  /** Conteúdo do gráfico */
  children: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Card para exibição de gráficos no dashboard
 * @param props - Props do componente
 * @returns Componente ChartCard
 */
export function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
