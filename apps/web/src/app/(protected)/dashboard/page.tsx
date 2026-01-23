'use client';

import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ListTodo,
  BarChart2,
} from 'lucide-react';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import {
  useAnalyticsOverview,
  useAnalyticsByStatus,
  useAnalyticsByPriority,
  useCompletionTrend,
  useProductivityMetrics,
} from '@/hooks/use-analytics';
import {
  KPICard,
  ChartCard,
  StatusPieChart,
  PriorityBarChart,
  CompletionTrendChart,
  ProductivityInsights,
} from '@/components/dashboard';

/**
 * Skeleton para loading dos KPIs
 */
function KPISkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-1 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para loading dos gráficos
 */
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-75 w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para loading dos insights
 */
function InsightsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Empty state quando não há dados suficientes
 */
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <BarChart2 className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Sem dados suficientes</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Crie algumas tarefas para começar a visualizar suas métricas de
          produtividade.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Página de dashboard de produtividade
 * Exibe KPIs, gráficos e insights de produtividade
 */
export default function DashboardPage() {
  const { data: overview, isLoading: isLoadingOverview } =
    useAnalyticsOverview();
  const { data: byStatus, isLoading: isLoadingByStatus } =
    useAnalyticsByStatus();
  const { data: byPriority, isLoading: isLoadingByPriority } =
    useAnalyticsByPriority();
  const { data: trend, isLoading: isLoadingTrend } = useCompletionTrend(7);
  const { data: productivity, isLoading: isLoadingProductivity } =
    useProductivityMetrics();

  const hasData = overview && overview.totalTasks > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe suas métricas de produtividade.
        </p>
      </div>

      {/* KPIs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Visão Geral</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoadingOverview ? (
            <>
              <KPISkeleton />
              <KPISkeleton />
              <KPISkeleton />
              <KPISkeleton />
            </>
          ) : overview ? (
            <>
              <KPICard
                title="Total de Tarefas"
                value={overview.totalTasks}
                icon={ListTodo}
                description="tarefas cadastradas"
              />
              <KPICard
                title="Taxa de Conclusão"
                value={`${overview.completionRate.toFixed(1)}%`}
                icon={CheckCircle2}
                description={`${overview.completedTasks} concluídas`}
                trend={
                  overview.completionRate > 50
                    ? { direction: 'up', value: 'Bom progresso!' }
                    : undefined
                }
              />
              <KPICard
                title="Tarefas Atrasadas"
                value={overview.overdueTasks}
                icon={AlertTriangle}
                description="precisam de atenção"
                trend={
                  overview.overdueTasks > 0
                    ? { direction: 'down', value: 'Atrasadas' }
                    : { direction: 'up', value: 'Em dia!' }
                }
              />
              <KPICard
                title="Vencem em Breve"
                value={overview.dueSoon}
                icon={Clock}
                description="nos próximos 3 dias"
              />
            </>
          ) : null}
        </div>
      </section>

      {/* Conteúdo principal - Gráficos e Insights */}
      {!hasData && !isLoadingOverview ? (
        <EmptyState />
      ) : (
        <>
          {/* Gráficos */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Distribuições</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Gráfico de Status */}
              {isLoadingByStatus ? (
                <ChartSkeleton />
              ) : byStatus ? (
                <ChartCard
                  title="Por Status"
                  description="Distribuição das tarefas por status"
                >
                  <StatusPieChart data={byStatus} />
                </ChartCard>
              ) : null}

              {/* Gráfico de Prioridade */}
              {isLoadingByPriority ? (
                <ChartSkeleton />
              ) : byPriority ? (
                <ChartCard
                  title="Por Prioridade"
                  description="Distribuição das tarefas por prioridade"
                >
                  <PriorityBarChart data={byPriority} />
                </ChartCard>
              ) : null}

              {/* Insights de Produtividade */}
              {isLoadingProductivity ? (
                <InsightsSkeleton />
              ) : productivity ? (
                <ProductivityInsights data={productivity} />
              ) : null}
            </div>
          </section>

          {/* Tendência de Conclusão */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Tendência</h2>
            {isLoadingTrend ? (
              <ChartSkeleton />
            ) : trend ? (
              <ChartCard
                title="Atividade dos Últimos 7 Dias"
                description="Tarefas criadas e concluídas por dia"
              >
                <CompletionTrendChart data={trend} />
              </ChartCard>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
