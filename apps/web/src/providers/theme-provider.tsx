'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Props do ThemeProvider
 */
interface ThemeProviderProps {
  /** Componentes filhos a serem envolvidos pelo provider */
  children: React.ReactNode;
}

/**
 * Provider de tema usando next-themes
 *
 * Configurado para:
 * - Usar atributo "class" para dark mode (compatível com Tailwind)
 * - Tema padrão "system" (segue preferência do SO)
 * - Habilitar preferência do sistema
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
}: ThemeProviderProps): React.ReactNode {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
