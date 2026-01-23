'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Skeleton } from '@workspace/ui/components/skeleton';

/**
 * Props do componente ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Componentes filhos a serem renderizados se autenticado */
  children: React.ReactNode;
}

/**
 * Componente de proteção de rotas
 * Verifica se o usuário está autenticado antes de renderizar os filhos
 * Redireciona para /login se não estiver autenticado
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading } = useAuthStore();

  useEffect(() => {
    // Se a hidratação foi concluída e não está autenticado, redireciona
    if (isHydrated && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, isLoading, router]);

  // Mostra skeleton enquanto hidrata ou carrega
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton da sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 border-r bg-card p-4 hidden md:block">
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Skeleton do conteúdo principal */}
        <div className="md:ml-64 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64 mt-6" />
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
