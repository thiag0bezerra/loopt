'use client';

import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

/**
 * Provider para notificações toast usando Sonner
 * Renderiza o componente Toaster do shadcn/ui
 */
export function ToastProvider(): ReactNode {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
