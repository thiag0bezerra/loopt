'use client';

import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { ReactNode } from 'react';

/**
 * Props do componente Providers
 */
interface ProvidersProps {
  /** Componentes filhos a serem envolvidos pelos providers */
  children: ReactNode;
}

/**
 * Componente que combina todos os providers da aplicação
 * Deve ser usado no layout raiz para envolver toda a aplicação
 */
export function Providers({ children }: ProvidersProps): ReactNode {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}
