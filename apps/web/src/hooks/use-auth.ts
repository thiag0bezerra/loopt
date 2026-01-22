import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, getRefreshToken } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@loopt/shared';
import { AxiosError } from 'axios';

/**
 * Dados de entrada para login
 */
interface LoginInput {
  /** Email do usuário */
  email: string;
  /** Senha do usuário */
  password: string;
}

/**
 * Dados de entrada para registro
 */
interface RegisterInput {
  /** Nome do usuário */
  name: string;
  /** Email do usuário */
  email: string;
  /** Senha do usuário */
  password: string;
}

/**
 * Resposta da API de autenticação
 */
interface AuthResponse {
  /** Token de acesso JWT */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Dados do usuário autenticado */
  user: User;
}

/**
 * Resposta da API de refresh token
 */
interface RefreshResponse {
  /** Novo token de acesso JWT */
  accessToken: string;
  /** Novo refresh token */
  refreshToken?: string;
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
 * Hook para realizar login
 * @returns Mutation do React Query para login
 */
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Login realizado com sucesso!');
      router.push('/tasks');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        'Erro ao realizar login. Tente novamente.';
      toast.error(message);
    },
  });
}

/**
 * Hook para realizar registro de novo usuário
 * @returns Mutation do React Query para registro
 */
export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Conta criada com sucesso!');
      router.push('/tasks');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ??
        'Erro ao criar conta. Tente novamente.';
      toast.error(message);
    },
  });
}

/**
 * Hook para buscar dados do usuário atual
 * @returns Query do React Query com dados do usuário
 */
export function useCurrentUser() {
  const { token, isHydrated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get<User>('/auth/me');
      return response.data;
    },
    enabled: !!token && isHydrated,
    staleTime: Infinity, // Não refetch automaticamente
    retry: false,
  });
}

/**
 * Hook para realizar refresh do token
 * @returns Mutation do React Query para refresh
 */
export function useRefreshToken() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await api.post<RefreshResponse>('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const user = useAuthStore.getState().user;
      if (user) {
        setAuth(user, data.accessToken, data.refreshToken);
      }
    },
    onError: () => {
      toast.error('Sessão expirada. Faça login novamente.');
      logout();
    },
  });
}

/**
 * Hook para realizar logout
 * @returns Função de logout
 */
export function useLogout() {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };
}
