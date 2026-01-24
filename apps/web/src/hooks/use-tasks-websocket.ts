import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { TASKS_QUERY_KEY, TASK_QUERY_KEY } from './use-tasks';
import type { Task } from '@loopt/shared';

/**
 * URL base da API para conexão WebSocket
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Tipo de ação para eventos de tarefa
 */
type TaskEventAction = 'created' | 'updated' | 'deleted';

/**
 * Payload dos eventos de tarefa recebidos via WebSocket
 */
interface TaskEventPayload {
  /** Tarefa afetada (objeto completo ou apenas id quando deletada) */
  task: Task | { id: string };
  /** Ação realizada */
  action: TaskEventAction;
}

/**
 * Retorno do hook useTasksWebsocket
 */
interface UseTasksWebsocketReturn {
  /** Indica se o socket está conectado */
  isConnected: boolean;
}

/**
 * Hook para conectar ao WebSocket de tarefas e invalidar queries automaticamente.
 * Conecta ao namespace /tasks com autenticação JWT.
 * Ouve eventos task:created, task:updated e task:deleted.
 */
export function useTasksWebsocket(): UseTasksWebsocketReturn {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  /**
   * Handler para eventos de tarefa recebidos via WebSocket
   */
  const handleTaskEvent = useCallback(
    (event: string, payload: TaskEventPayload) => {
      // Invalida a lista de tarefas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });

      // Para eventos de atualização, também invalida a query individual
      if (payload.action === 'updated' && 'title' in payload.task) {
        queryClient.invalidateQueries({
          queryKey: [TASK_QUERY_KEY, payload.task.id],
        });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    // Aguarda a hidratação do auth store, autenticação e fim do loading antes de conectar
    if (!isHydrated || !isAuthenticated || isLoading) {
      return;
    }

    const token = getAccessToken();

    // Não conecta se não há token de autenticação
    if (!token) {
      return;
    }

    // Cria conexão com o namespace /tasks
    const socket = io(`${API_BASE_URL}/tasks`, {
      auth: {
        token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Handlers de conexão
    socket.on('connect', () => {
      console.log('[WebSocket] Conectado ao servidor de tarefas');
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] Desconectado: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Erro de conexão:', error.message);
    });

    // Handlers de eventos de tarefa
    socket.on('task:created', (payload: TaskEventPayload) => {
      handleTaskEvent('task:created', payload);
    });

    socket.on('task:updated', (payload: TaskEventPayload) => {
      handleTaskEvent('task:updated', payload);
    });

    socket.on('task:deleted', (payload: TaskEventPayload) => {
      handleTaskEvent('task:deleted', payload);
    });

    // Cleanup: desconecta ao desmontar
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [handleTaskEvent, isHydrated, isAuthenticated, isLoading]);

  /**
   * Retorna o estado da conexão
   */
  const isConnected = socketRef.current?.connected ?? false;

  return {
    isConnected,
  };
}
