'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Props do layout de autenticação
 */
interface AuthLayoutProps {
  /** Componentes filhos (páginas de login/registro) */
  children: React.ReactNode;
}

/**
 * Layout para páginas de autenticação (login/registro)
 * Centraliza o conteúdo e exibe o logo do app
 * Redireciona para /tasks se o usuário já estiver autenticado
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    // Se já está autenticado, redireciona para /tasks
    if (isHydrated && isAuthenticated) {
      router.push('/tasks');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Mostra loading enquanto hidrata o estado
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="w-full max-w-md">
          <Skeleton className="h-100 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Se autenticado, não renderiza nada (será redirecionado)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo e título do app */}
      <div className="flex items-center gap-2 mb-8">
        <CheckSquare className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Loopt</h1>
      </div>

      {/* Conteúdo da página (formulário de login/registro) */}
      {children}

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Loopt. Todos os direitos reservados.
      </p>
    </div>
  );
}
