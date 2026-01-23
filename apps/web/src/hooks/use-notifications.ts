import { useEffect, useRef } from 'react';
import { useAnalyticsOverview } from './use-analytics';
import { useNotificationsStore } from '@/stores/notifications.store';

/**
 * Hook para gerar notificações baseadas nos dados de analytics
 *
 * Monitora:
 * - Tarefas atrasadas (overdueTasks)
 * - Tarefas próximas do vencimento (dueSoon)
 *
 * Gera notificações quando há mudanças relevantes
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   useNotificationsFromAnalytics();
 *   // ...
 * }
 * ```
 */
export function useNotificationsFromAnalytics() {
  const { data: overview } = useAnalyticsOverview();
  const { addNotification, notifications } = useNotificationsStore();

  // Refs para tracking de valores anteriores
  const prevOverdueRef = useRef<number | null>(null);
  const prevDueSoonRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!overview) return;

    const { overdueTasks, dueSoon } = overview;

    // Primeira vez - apenas inicializar refs sem criar notificações
    if (!hasInitializedRef.current) {
      prevOverdueRef.current = overdueTasks;
      prevDueSoonRef.current = dueSoon;
      hasInitializedRef.current = true;

      // Verificar se há tarefas atrasadas na inicialização
      if (overdueTasks > 0) {
        // Verificar se já existe uma notificação recente sobre isso
        const hasRecentOverdueNotification = notifications.some(
          (n) =>
            n.type === 'error' &&
            n.title.includes('atrasada') &&
            new Date().getTime() - new Date(n.createdAt).getTime() <
              24 * 60 * 60 * 1000, // 24h
        );

        if (!hasRecentOverdueNotification) {
          addNotification({
            title:
              overdueTasks === 1
                ? 'Você tem 1 tarefa atrasada'
                : `Você tem ${overdueTasks} tarefas atrasadas`,
            description: 'Verifique suas tarefas para manter o foco',
            type: 'error',
          });
        }
      }

      return;
    }

    // Detectar novas tarefas atrasadas
    if (
      prevOverdueRef.current !== null &&
      overdueTasks > prevOverdueRef.current
    ) {
      const newOverdue = overdueTasks - prevOverdueRef.current;
      addNotification({
        title:
          newOverdue === 1
            ? 'Uma tarefa ficou atrasada'
            : `${newOverdue} tarefas ficaram atrasadas`,
        description: 'Clique para visualizar',
        type: 'error',
      });
    }

    // Detectar novas tarefas próximas do vencimento
    if (prevDueSoonRef.current !== null && dueSoon > prevDueSoonRef.current) {
      const newDueSoon = dueSoon - prevDueSoonRef.current;
      addNotification({
        title:
          newDueSoon === 1
            ? 'Uma tarefa vence em breve'
            : `${newDueSoon} tarefas vencem em breve`,
        description: 'Prazo nos próximos 3 dias',
        type: 'warning',
      });
    }

    // Atualizar refs
    prevOverdueRef.current = overdueTasks;
    prevDueSoonRef.current = dueSoon;
  }, [overview, addNotification, notifications]);
}
