'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, BarChart2, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { ThemeToggle } from './theme-toggle';
import { NotificationsDropdown } from './notifications-dropdown';

/**
 * Links de navegação do app
 */
const navLinks = [
  {
    href: '/tasks',
    label: 'Tarefas',
    icon: CheckSquare,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart2,
  },
];

/**
 * Sidebar de navegação principal
 *
 * Exibe:
 * - Logo/nome do app no topo
 * - Links de navegação com ícones
 * - Toggle de tema
 * - Seção do usuário com nome, email e logout
 *
 * @example
 * ```tsx
 * <Sidebar />
 * ```
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/tasks" className="flex items-center gap-2 font-semibold">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span>Loopt</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationsDropdown />
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-secondary text-secondary-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
