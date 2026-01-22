import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@loopt/shared';
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api';

/**
 * Interface do estado de autenticação
 */
interface AuthState {
  /** Usuário autenticado ou null */
  user: User | null;
  /** Token de acesso JWT */
  token: string | null;
  /** Flag indicando se o usuário está autenticado */
  isAuthenticated: boolean;
  /** Flag indicando se a hidratação do estado foi concluída */
  isHydrated: boolean;
  /** Flag indicando se está carregando dados do usuário */
  isLoading: boolean;
}

/**
 * Interface das ações de autenticação
 */
interface AuthActions {
  /**
   * Define os dados de autenticação após login/registro
   * @param user - Dados do usuário
   * @param accessToken - Token de acesso JWT
   * @param refreshToken - Refresh token opcional
   */
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;

  /**
   * Remove os dados de autenticação e redireciona para login
   */
  logout: () => void;

  /**
   * Hidrata o estado a partir do token armazenado
   * Busca os dados do usuário na API se houver token válido
   */
  hydrate: () => Promise<void>;

  /**
   * Marca o estado como hidratado
   */
  setHydrated: (value: boolean) => void;
}

/**
 * Tipo completo da store de autenticação
 */
type AuthStore = AuthState & AuthActions;

/**
 * Store de autenticação usando Zustand com persistência
 * Gerencia o estado do usuário logado e tokens JWT
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,

      // Ações
      setAuth: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({
          user,
          token: accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearTokens();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Redireciona para login após logout
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      hydrate: async () => {
        const token = getAccessToken();

        if (!token) {
          set({ isHydrated: true, isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await api.get<User>('/auth/me');
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
          });
        } catch {
          // Token inválido ou expirado
          clearTokens();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isHydrated: true,
            isLoading: false,
          });
        }
      },

      setHydrated: (value) => {
        set({ isHydrated: value });
      },
    }),
    {
      name: 'auth-storage',
      // Persiste apenas o token, não o usuário (será buscado via API)
      partialize: (state) => ({
        token: state.token,
      }),
      // Após restaurar do storage, executa a hidratação
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate();
        }
      },
    },
  ),
);
