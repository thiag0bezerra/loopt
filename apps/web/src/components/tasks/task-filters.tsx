'use client';

import * as React from 'react';
import { ArrowDownAZ, ArrowUpZA, Search, X, Tag } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@loopt/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTags } from '@/hooks/use-tags';
import { TagBadge } from './tag-badge';

/**
 * Valores de filtro de tarefas
 */
export interface TaskFilterValues {
  /** Filtrar por status */
  status?: TaskStatus | 'all';
  /** Filtrar por prioridade */
  priority?: TaskPriority | 'all';
  /** Filtrar por tag */
  tagId?: string | 'all';
  /** Busca em título e descrição */
  search?: string;
  /** Campo para ordenação */
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority';
  /** Direção da ordenação */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Props do componente TaskFilters
 */
export interface TaskFiltersProps {
  /** Valores atuais dos filtros */
  values: TaskFilterValues;
  /** Callback ao alterar filtros */
  onChange: (values: TaskFilterValues) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Mapeamento de status para labels em português
 */
const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: TaskStatus.PENDING, label: 'Pendente' },
  { value: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
  { value: TaskStatus.COMPLETED, label: 'Concluída' },
];

/**
 * Mapeamento de prioridade para labels em português
 */
const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas as prioridades' },
  { value: TaskPriority.LOW, label: 'Baixa' },
  { value: TaskPriority.MEDIUM, label: 'Média' },
  { value: TaskPriority.HIGH, label: 'Alta' },
];

/**
 * Opções de ordenação
 */
const sortByOptions: { value: string; label: string }[] = [
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'updatedAt', label: 'Data de atualização' },
  { value: 'dueDate', label: 'Data de vencimento' },
  { value: 'title', label: 'Título' },
  { value: 'priority', label: 'Prioridade' },
];

/**
 * Hook customizado para debounce de valor
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (default: 300ms)
 * @returns Valor debounced
 */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Componente de filtros para a lista de tarefas
 *
 * Inclui filtros por status, prioridade, tag, busca com debounce e ordenação.
 *
 * @example
 * ```tsx
 * <TaskFilters
 *   values={filters}
 *   onChange={(newFilters) => setFilters(newFilters)}
 * />
 * ```
 */
export function TaskFilters({ values, onChange, className }: TaskFiltersProps) {
  // Estado local para o campo de busca (antes do debounce)
  const [searchInput, setSearchInput] = React.useState(values.search ?? '');

  // Valor debounced da busca
  const debouncedSearch = useDebounce(searchInput, 300);

  // Busca as tags do usuário
  const { data: tags = [] } = useTags();

  // Atualiza os filtros quando a busca debounced muda
  React.useEffect(() => {
    if (debouncedSearch !== values.search) {
      onChange({ ...values, search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, values, onChange]);

  // Sincroniza o input local com os valores externos
  React.useEffect(() => {
    setSearchInput(values.search ?? '');
  }, [values.search]);

  /**
   * Manipula mudança de status
   */
  const handleStatusChange = (status: string) => {
    onChange({
      ...values,
      status: status === 'all' ? undefined : (status as TaskStatus),
    });
  };

  /**
   * Manipula mudança de prioridade
   */
  const handlePriorityChange = (priority: string) => {
    onChange({
      ...values,
      priority: priority === 'all' ? undefined : (priority as TaskPriority),
    });
  };

  /**
   * Manipula mudança de tag
   */
  const handleTagChange = (tagId: string) => {
    onChange({
      ...values,
      tagId: tagId === 'all' ? undefined : tagId,
    });
  };

  /**
   * Manipula mudança de campo de ordenação
   */
  const handleSortByChange = (sortBy: string) => {
    onChange({
      ...values,
      sortBy: sortBy as TaskFilterValues['sortBy'],
    });
  };

  /**
   * Alterna a direção da ordenação
   */
  const toggleSortOrder = () => {
    onChange({
      ...values,
      sortOrder: values.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    });
  };

  /**
   * Limpa o campo de busca
   */
  const clearSearch = () => {
    setSearchInput('');
    onChange({ ...values, search: undefined });
  };

  /**
   * Limpa todos os filtros
   */
  const clearAllFilters = () => {
    setSearchInput('');
    onChange({
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  };

  const hasActiveFilters =
    values.status ||
    values.priority ||
    values.tagId ||
    values.search ||
    values.sortBy !== 'createdAt' ||
    values.sortOrder !== 'DESC';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Linha 1: Busca e ordenação */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Campo de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Ordenação */}
        <div className="flex gap-2">
          <Select
            value={values.sortBy ?? 'createdAt'}
            onValueChange={handleSortByChange}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortByOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            aria-label={
              values.sortOrder === 'ASC'
                ? 'Ordenar decrescente'
                : 'Ordenar crescente'
            }
          >
            {values.sortOrder === 'ASC' ? (
              <ArrowUpZA className="h-4 w-4" />
            ) : (
              <ArrowDownAZ className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Linha 2: Filtros por status e prioridade */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filtro por status */}
        <Select
          value={values.status ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por prioridade */}
        <Select
          value={values.priority ?? 'all'}
          onValueChange={handlePriorityChange}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por tag */}
        {tags.length > 0 && (
          <Select value={values.tagId ?? 'all'} onValueChange={handleTagChange}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Todas as tags
                </span>
              </SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Botão para limpar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
