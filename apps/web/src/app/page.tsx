'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Skeleton } from '@workspace/ui/components/skeleton';

/**
 * Página inicial
 * Redireciona para /tasks se autenticado, ou /login caso contrário
 */
export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.push('/tasks');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isHydrated, router]);

  // Mostra loading enquanto determina o redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}
