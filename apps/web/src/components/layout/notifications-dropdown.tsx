'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotificationsStore,
  type Notification,
  type NotificationType,
} from '@/stores/notifications.store';

/**
 * Configuração de ícone e cor para cada tipo de notificação
 */
const notificationConfig: Record<
  NotificationType,
  {
    icon: React.ElementType;
    className: string;
  }
> = {
  info: {
    icon: Info,
    className: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-yellow-500',
  },
  error: {
    icon: AlertCircle,
    className: 'text-destructive',
  },
  success: {
    icon: CheckCircle2,
    className: 'text-green-500',
  },
};

/**
 * Props de um item de notificação
 */
interface NotificationItemProps {
  /** Dados da notificação */
  notification: Notification;
  /** Callback ao marcar como lida */
  onMarkAsRead: (id: string) => void;
  /** Callback ao remover */
  onRemove: (id: string) => void;
}

/**
 * Componente de item de notificação
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
}: NotificationItemProps) {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  /**
   * Formata a data relativa
   */
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md transition-colors',
        !notification.read && 'bg-muted/50',
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.className)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="h-3 w-3" />
            <span className="sr-only">Marcar como lida</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(notification.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
          <span className="sr-only">Remover</span>
        </Button>
      </div>
    </div>
  );

  // Se tem taskId, envolver em link
  if (notification.taskId) {
    return <Link href={`/tasks?taskId=${notification.taskId}`}>{content}</Link>;
  }

  return content;
}

/**
 * Dropdown de notificações in-app
 *
 * Exibe:
 * - Ícone de sino com badge de não lidas
 * - Lista de notificações recentes
 * - Ações para marcar como lida e remover
 *
 * @example
 * ```tsx
 * <NotificationsDropdown />
 * ```
 */
export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationsStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            Notificações{unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={clearAll}
              >
                Limpar todas
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
