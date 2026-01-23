'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination';

/**
 * Props do componente TaskPagination
 */
export interface TaskPaginationProps {
  /** Página atual (1-indexed) */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Total de itens */
  totalItems?: number;
  /** Itens por página */
  itemsPerPage?: number;
  /** Callback ao mudar de página */
  onPageChange: (page: number) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Gera array de números de páginas para exibir
 * @param currentPage - Página atual
 * @param totalPages - Total de páginas
 * @returns Array de números de páginas ou 'ellipsis'
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    // Mostra todas as páginas se houver poucas
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Sempre mostra a primeira página
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Páginas ao redor da atual
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Sempre mostra a última página
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Componente de paginação para a lista de tarefas
 *
 * Exibe navegação de páginas com Previous/Next e números de página.
 * Adapta-se para mostrar ellipsis quando há muitas páginas.
 *
 * @example
 * ```tsx
 * <TaskPagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={100}
 *   itemsPerPage={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */
export function TaskPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className,
}: TaskPaginationProps) {
  // Não renderiza se há apenas uma página ou nenhuma
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  /**
   * Manipula clique em página
   */
  const handlePageClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number,
  ) => {
    e.preventDefault();
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Calcula range de itens exibidos
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems ?? 0);

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 sm:flex-row sm:justify-between',
        className,
      )}
    >
      {/* Informação de itens */}
      {totalItems !== undefined && (
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Mostrando {startItem}-{endItem} de {totalItems} tarefas
        </p>
      )}

      {/* Paginação */}
      <Pagination className="order-1 sm:order-2">
        <PaginationContent className="gap-1">
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => handlePageClick(e, currentPage - 1)}
              aria-disabled={isFirstPage}
              tabIndex={isFirstPage ? -1 : undefined}
              className={cn(
                'h-10 w-10 p-0 sm:h-9 sm:w-auto sm:px-3',
                isFirstPage && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>

          {/* Números de página - esconde em mobile pequeno, mostra apenas current */}
          <div className="hidden xs:flex gap-1">
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => handlePageClick(e, page)}
                    isActive={page === currentPage}
                    className="h-10 w-10 sm:h-9 sm:w-9"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
          </div>

          {/* Mostra apenas página atual em mobile muito pequeno */}
          <div className="flex xs:hidden items-center gap-1">
            <span className="text-sm font-medium px-2">
              {currentPage} / {totalPages}
            </span>
          </div>

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => handlePageClick(e, currentPage + 1)}
              aria-disabled={isLastPage}
              tabIndex={isLastPage ? -1 : undefined}
              className={cn(
                'h-10 w-10 p-0 sm:h-9 sm:w-auto sm:px-3',
                isLastPage && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
