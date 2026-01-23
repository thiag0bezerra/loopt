'use client';

import * as React from 'react';
import {
  ArrowDownAZ,
  ArrowUpZA,
  Search,
  X,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { TaskStatus, TaskPriority } from '@loopt/shared';
import { cn } from '@workspace/ui/lib/utils';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { useTags } from '@/hooks/use-tags';

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

  // Conta quantos filtros estão ativos (excluindo ordenação)
  const activeFiltersCount = [
    values.status,
    values.priority,
    values.tagId,
    values.search,
  ].filter(Boolean).length;

  // Estado para o collapsible em mobile
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Linha 1: Busca, toggle de filtros (mobile) e ordenação */}
      <div className="flex flex-col gap-3">
        {/* Busca - sempre visível e full width em mobile */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 pl-10 pr-10 text-base md:h-10 md:text-sm"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 md:h-8 md:w-8"
              onClick={clearSearch}
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Linha de ações: ordenação + toggle filtros */}
        <div className="flex items-center gap-2">
          {/* Ordenação - compacta em mobile */}
          <div className="flex flex-1 gap-2 sm:flex-initial">
            <Select
              value={values.sortBy ?? 'createdAt'}
              onValueChange={handleSortByChange}
            >
              <SelectTrigger className="h-11 flex-1 sm:w-[180px] md:h-10">
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
              className="h-11 w-11 shrink-0 md:h-10 md:w-10"
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

          {/* Toggle de filtros para mobile */}
          <Button
            variant={activeFiltersCount > 0 ? 'default' : 'outline'}
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="h-11 shrink-0 gap-2 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filtros - colapsáveis em mobile, sempre visíveis em desktop */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        {/* Desktop: sempre visível */}
        <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          {/* Filtro por status */}
          <Select
            value={values.status ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-10 w-[160px]">
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
            <SelectTrigger className="h-10 w-[180px]">
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
            <Select
              value={values.tagId ?? 'all'}
              onValueChange={handleTagChange}
            >
              <SelectTrigger className="h-10 w-[160px]">
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
                        className="h-3 w-3 rounded-full shrink-0"
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
              size="sm"
              onClick={clearAllFilters}
              className="h-10 text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>

        {/* Mobile: colapsável */}
        <CollapsibleContent className="sm:hidden">
          <div className="flex flex-col gap-3 pt-3 border-t mt-3">
            {/* Filtro por status */}
            <Select
              value={values.status ?? 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-11 w-full">
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
              <SelectTrigger className="h-11 w-full">
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
              <Select
                value={values.tagId ?? 'all'}
                onValueChange={handleTagChange}
              >
                <SelectTrigger className="h-11 w-full">
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
                          className="h-3 w-3 rounded-full shrink-0"
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
                variant="outline"
                onClick={clearAllFilters}
                className="h-11 w-full text-muted-foreground"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar todos os filtros
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
