import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tipo de notificação
 */
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

/**
 * Interface de uma notificação
 */
export interface Notification {
  /** ID único da notificação */
  id: string;
  /** Título da notificação */
  title: string;
  /** Descrição da notificação */
  description?: string;
  /** Tipo da notificação */
  type: NotificationType;
  /** Se foi lida */
  read: boolean;
  /** ID da tarefa relacionada (se houver) */
  taskId?: string;
  /** Data de criação */
  createdAt: Date;
}

/**
 * Interface do estado de notificações
 */
interface NotificationsState {
  /** Lista de notificações */
  notifications: Notification[];
  /** Contador de notificações não lidas */
  unreadCount: number;
}

/**
 * Interface das ações de notificações
 */
interface NotificationsActions {
  /**
   * Adiciona uma nova notificação
   * @param notification - Dados da notificação (sem id e createdAt)
   */
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  ) => void;

  /**
   * Marca uma notificação como lida
   * @param id - ID da notificação
   */
  markAsRead: (id: string) => void;

  /**
   * Marca todas as notificações como lidas
   */
  markAllAsRead: () => void;

  /**
   * Remove uma notificação
   * @param id - ID da notificação
   */
  removeNotification: (id: string) => void;

  /**
   * Limpa todas as notificações
   */
  clearAll: () => void;
}

/**
 * Gera um ID único para notificação
 */
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Store de notificações usando Zustand
 *
 * Gerencia o estado de notificações in-app:
 * - Adicionar/remover notificações
 * - Marcar como lida
 * - Contador de não lidas
 * - Persistência no localStorage
 *
 * @example
 * ```tsx
 * const { notifications, addNotification, markAsRead } = useNotificationsStore();
 *
 * // Adicionar notificação
 * addNotification({
 *   title: 'Tarefa atrasada',
 *   description: 'A tarefa "Finalizar relatório" está atrasada',
 *   type: 'warning',
 *   taskId: '123'
 * });
 *
 * // Marcar como lida
 * markAsRead('notif_123');
 * ```
 */
export const useNotificationsStore = create<
  NotificationsState & NotificationsActions
>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          read: false,
          createdAt: new Date(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Manter máximo de 50 notificações
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) {
            return state;
          }

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'loopt-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    },
  ),
);
