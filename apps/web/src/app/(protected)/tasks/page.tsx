'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, LogOut } from 'lucide-react';

/**
 * Página temporária de tarefas
 * Será expandida no Ciclo 8
 */
export default function TasksPage() {
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Placeholder content */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Loopt!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta página será expandida no Ciclo 8 com a gestão completa de
              tarefas, incluindo criação, edição, exclusão, filtros e paginação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
