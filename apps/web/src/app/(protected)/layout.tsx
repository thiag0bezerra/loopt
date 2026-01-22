import { ProtectedRoute } from '@/components/auth/protected-route';

/**
 * Props do layout protegido
 */
interface ProtectedLayoutProps {
  /** Componentes filhos (páginas protegidas) */
  children: React.ReactNode;
}

/**
 * Layout para páginas protegidas (requer autenticação)
 * Envolve o conteúdo com o componente ProtectedRoute
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
