'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Props do QueryProvider
 */
interface QueryProviderProps {
  /** Componentes filhos a serem envolvidos pelo provider */
  children: ReactNode;
}

/**
 * Provider do React Query para gerenciamento de estado de servidor
 * Configura o QueryClient com opções padrão para queries e mutations
 */
export function QueryProvider({ children }: QueryProviderProps): ReactNode {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /** Tempo em que os dados são considerados frescos (5 minutos) */
            staleTime: 5 * 60 * 1000,
            /** Número de tentativas de retry em caso de falha */
            retry: 1,
            /** Não refetch ao focar a janela por padrão */
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
