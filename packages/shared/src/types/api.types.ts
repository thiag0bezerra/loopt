/**
 * Resposta padrão da API
 */
export interface ApiResponse<T> {
  /** Dados retornados */
  data: T;
  /** Mensagem opcional */
  message?: string;
}

/**
 * Metadados de paginação
 */
export interface PaginationMeta {
  /** Total de itens */
  total: number;
  /** Página atual */
  page: number;
  /** Limite por página */
  limit: number;
  /** Total de páginas */
  totalPages: number;
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
  /** Array de dados retornados */
  data: T[];
  /** Metadados de paginação */
  meta: PaginationMeta;
}
