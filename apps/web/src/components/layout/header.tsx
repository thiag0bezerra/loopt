'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckSquare } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';
import { NotificationsDropdown } from './notifications-dropdown';

/**
 * Header para dispositivos móveis
 *
 * Exibe apenas em telas pequenas (< md):
 * - Logo/nome do app
 * - Botão hamburguer para abrir o menu mobile
 * - Toggle de tema e notificações
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Logo */}
      <Link href="/tasks" className="flex items-center gap-2 font-semibold">
        <CheckSquare className="h-6 w-6 text-primary" />
        <span>Loopt</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <NotificationsDropdown />
        <ThemeToggle />
      </div>
    </header>
  );
}
