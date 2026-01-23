'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Representa uma tag para exibição no badge
 */
export interface TagBadgeTag {
  /** Identificador único da tag */
  id: string;
  /** Nome da tag */
  name: string;
  /** Cor da tag em formato hexadecimal */
  color: string;
}

/**
 * Props do componente TagBadge
 */
export interface TagBadgeProps {
  /** Tag a ser exibida */
  tag: TagBadgeTag;
  /** Se deve exibir botão de remover */
  removable?: boolean;
  /** Callback ao clicar em remover */
  onRemove?: (tagId: string) => void;
  /** Tamanho do badge */
  size?: 'sm' | 'md';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Calcula a luminosidade de uma cor para determinar se o texto deve ser claro ou escuro
 * @param hexColor - Cor em formato hexadecimal (#RRGGBB)
 * @returns Valor de luminosidade (0-255)
 */
function getLuminance(hexColor: string): number {
  // Remove o # se existir
  const hex = hexColor.replace('#', '');

  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Fórmula de luminosidade percebida
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Determina se o texto deve ser claro ou escuro baseado na cor de fundo
 * @param hexColor - Cor de fundo em formato hexadecimal
 * @returns 'light' se o texto deve ser claro, 'dark' se deve ser escuro
 */
function getContrastTextColor(hexColor: string): 'light' | 'dark' {
  const luminance = getLuminance(hexColor);
  return luminance > 128 ? 'dark' : 'light';
}

/**
 * Componente de badge para exibição de uma tag
 *
 * Exibe a tag com cor de fundo dinâmica e texto com contraste adequado.
 * Opcionalmente pode exibir um botão para remover a tag.
 *
 * @example
 * ```tsx
 * // Tag simples
 * <TagBadge tag={{ id: '1', name: 'Frontend', color: '#3b82f6' }} />
 *
 * // Tag removível
 * <TagBadge
 *   tag={{ id: '1', name: 'Frontend', color: '#3b82f6' }}
 *   removable
 *   onRemove={(id) => handleRemove(id)}
 * />
 * ```
 */
export function TagBadge({
  tag,
  removable = false,
  onRemove,
  size = 'sm',
  className,
}: TagBadgeProps) {
  const textColorClass = getContrastTextColor(tag.color);

  /**
   * Manipula o clique no botão de remover
   */
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(tag.id);
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-2.5 py-1',
        textColorClass === 'light' && 'text-white',
        textColorClass === 'dark' && 'text-gray-900',
        removable && 'pr-1',
        className,
      )}
      style={{ backgroundColor: tag.color }}
    >
      <span className="truncate max-w-25">{tag.name}</span>

      {removable && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-4 w-4 ml-1 p-0 hover:bg-black/10',
            textColorClass === 'light' && 'hover:bg-white/20',
            textColorClass === 'dark' && 'hover:bg-black/10',
          )}
          onClick={handleRemove}
          aria-label={`Remover tag ${tag.name}`}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}
