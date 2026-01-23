'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, BarChart2, LogOut, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';

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
 * Navegação mobile usando Sheet (drawer)
 *
 * Exibe um botão hamburger que abre um drawer lateral
 * contendo os links de navegação e informações do usuário.
 *
 * @example
 * ```tsx
 * <MobileNav />
 * ```
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const [open, setOpen] = React.useState(false);

  /**
   * Fecha o menu ao navegar
   */
  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Loopt
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link key={link.href} href={link.href} onClick={handleLinkClick}>
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
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
