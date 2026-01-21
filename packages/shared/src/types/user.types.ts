/**
 * Representa um usuário do sistema
 */
export interface User {
  /** Identificador único do usuário (UUID) */
  id: string;
  /** Email do usuário (único) */
  email: string;
  /** Nome do usuário */
  name: string;
  /** Data de criação */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
}

/**
 * Dados necessários para criar um novo usuário
 */
export interface CreateUser {
  /** Email do usuário */
  email: string;
  /** Senha do usuário (será hasheada) */
  password: string;
  /** Nome do usuário */
  name: string;
}
