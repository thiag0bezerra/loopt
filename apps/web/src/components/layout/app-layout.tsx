'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, BarChart2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';

/**
 * Props do componente AppLayout
 */
interface AppLayoutProps {
  /** Conteúdo da página */
  children: React.ReactNode;
}

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
 * Layout principal da aplicação autenticada
 *
 * Inclui:
 * - Header com logo e navegação
 * - Área do usuário com logout
 * - Container para o conteúdo da página
 *
 * @example
 * ```tsx
 * <AppLayout>
 *   <TasksPage />
 * </AppLayout>
 * ```
 */
export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Logo */}
          <Link href="/tasks" className="flex items-center gap-2 font-semibold">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span>Loopt</span>
          </Link>

          {/* Navigation */}
          <nav className="ml-8 flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2',
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

          {/* User area */}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">{children}</main>
    </div>
  );
}
