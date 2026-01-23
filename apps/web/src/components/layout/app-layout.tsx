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
 * Layout responsivo mobile-first:
 * - Mobile (< md): Header com menu hamburguer no topo
 * - Desktop (md+): Sidebar fixa à esquerda com conteúdo à direita
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

        {/* Main content - mobile-first padding */}
        <main className="flex-1 md:ml-64">
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
