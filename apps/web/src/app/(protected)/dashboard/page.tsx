'use client';

import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de dashboard de produtividade
 * Será expandida no Ciclo 9
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe suas métricas de produtividade.
        </p>
      </div>

      {/* Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Em Breve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O dashboard de produtividade será implementado no Ciclo 9, incluindo
            KPIs, gráficos de distribuição por status e prioridade, e tendências
            de conclusão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
