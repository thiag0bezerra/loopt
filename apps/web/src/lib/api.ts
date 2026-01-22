import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * URL base da API obtida das variáveis de ambiente
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Chave para armazenamento do token de acesso no localStorage
 */
const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * Chave para armazenamento do refresh token no localStorage
 */
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Instância configurada do Axios para comunicação com a API
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtém o token de acesso do localStorage
 * @returns O token de acesso ou null se não existir
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Obtém o refresh token do localStorage
 * @returns O refresh token ou null se não existir
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Salva os tokens no localStorage
 * @param accessToken - Token de acesso JWT
 * @param refreshToken - Refresh token opcional
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Remove os tokens do localStorage
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Flag para evitar múltiplas tentativas de refresh simultâneas
 */
let isRefreshing = false;

/**
 * Fila de requisições aguardando o refresh do token
 */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Processa a fila de requisições após refresh do token
 * @param error - Erro ocorrido durante o refresh (se houver)
 * @param token - Novo token obtido (se sucesso)
 */
function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Interceptor de request para adicionar o token de autenticação
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor de response para tratar erros de autenticação (401)
 * e fazer refresh automático do token
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se não for erro 401 ou já tentou retry, rejeita
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Se já está fazendo refresh, adiciona à fila
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    // Se não tem refresh token, limpa auth e redireciona
    if (!refreshToken) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    try {
      // Tenta fazer refresh do token
      const response = await axios.post<{
        accessToken: string;
        refreshToken?: string;
      }>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      setTokens(accessToken, newRefreshToken);

      // Atualiza o header da requisição original
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Processa a fila com sucesso
      processQueue(null, accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      // Falhou o refresh, limpa auth e redireciona
      processQueue(refreshError as Error);
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
