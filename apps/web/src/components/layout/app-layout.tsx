'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

/**
 * Props do componente AppLayout
 */
interface AppLayoutProps {
  /** Conteúdo da página */
  children: React.ReactNode;
}

/**
 * Layout principal da aplicação autenticada
 *
 * Layout responsivo:
 * - Desktop (md+): Sidebar fixa à esquerda com conteúdo à direita
 * - Mobile (< md): Header com menu hamburguer no topo
 *
 * @example
 * ```tsx
 * <AppLayout>
 *   <TasksPage />
 * </AppLayout>
 * ```
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <Header />

      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <div className="fixed inset-y-0 left-0 z-40 w-64">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-64">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
