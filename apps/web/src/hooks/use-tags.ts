'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

/**
 * Representa uma tag do sistema
 */
export interface Tag {
  /** Identificador único da tag (UUID) */
  id: string;
  /** Nome da tag */
  name: string;
  /** Cor da tag em formato hexadecimal */
  color: string;
  /** ID do usuário proprietário */
  userId: string;
  /** Data de criação */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
}

/**
 * Dados para criação de uma tag
 */
export interface CreateTagInput {
  /** Nome da tag (obrigatório, max 50 caracteres) */
  name: string;
  /** Cor da tag em formato hexadecimal (opcional, default: #6366f1) */
  color?: string;
}

/**
 * Dados para atualização de uma tag
 */
export interface UpdateTagInput {
  /** Nome da tag */
  name?: string;
  /** Cor da tag em formato hexadecimal */
  color?: string;
}

/**
 * Erro retornado pela API
 */
interface ApiError {
  /** Mensagem de erro */
  message: string;
  /** Código de erro HTTP */
  statusCode: number;
}

/**
 * Chave de cache para queries de tags
 */
export const TAGS_QUERY_KEY = 'tags';

/**
 * Hook para listar tags do usuário
 * @returns Query do React Query com tags
 */
export function useTags() {
  return useQuery<Tag[], Error>({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: async () => {
      const response = await api.get<Tag[]>('/tags');
      return response.data;
    },
  });
}

/**
 * Hook para criar uma nova tag
 * @returns Mutation do React Query para criação de tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<Tag, AxiosError<ApiError>, CreateTagInput>({
    mutationFn: async (data) => {
      const response = await api.post<Tag>('/tags', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      toast.success('Tag criada com sucesso!');
    },
    onError: (error) => {
      const message = error.response?.data?.message ?? 'Erro ao criar tag';
      toast.error(message);
    },
  });
}

/**
 * Hook para atualizar uma tag existente
 * @returns Mutation do React Query para atualização de tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<
    Tag,
    AxiosError<ApiError>,
    { id: string; data: UpdateTagInput }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<Tag>(`/tags/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      toast.success('Tag atualizada com sucesso!');
    },
    onError: (error) => {
      const message = error.response?.data?.message ?? 'Erro ao atualizar tag';
      toast.error(message);
    },
  });
}

/**
 * Hook para deletar uma tag
 * @returns Mutation do React Query para deleção de tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      toast.success('Tag excluída com sucesso!');
    },
    onError: (error) => {
      const message = error.response?.data?.message ?? 'Erro ao excluir tag';
      toast.error(message);
    },
  });
}
