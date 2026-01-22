import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto';

/** Payload do token JWT */
export interface JwtPayload {
  sub: string;
  email: string;
  /** Tipo do token: 'access' ou 'refresh' */
  type?: 'access' | 'refresh';
}

/** Resposta de autenticação */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

/** Resposta de refresh token */
export interface RefreshResponse {
  accessToken: string;
}

/** Tempo de expiração padrão para refresh token (7 dias) */
const REFRESH_TOKEN_EXPIRES_IN = '7d';

/**
 * Serviço responsável pela autenticação
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra um novo usuário
   * @param dto - Dados do registro
   * @returns Token de acesso, refresh token e dados do usuário
   * @throws ConflictException se email já estiver em uso
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = this.generateTokens(user);

    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Realiza login do usuário
   * @param dto - Credenciais de login
   * @returns Token de acesso, refresh token e dados do usuário
   * @throws UnauthorizedException se credenciais inválidas
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Gera novo access token usando um refresh token válido
   * @param refreshToken - Refresh token
   * @returns Novo access token
   * @throws UnauthorizedException se refresh token inválido ou expirado
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Verifica se é um refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      // Verifica se o usuário ainda existe
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Gera novo access token
      const accessPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        type: 'access',
      };
      const accessToken = this.jwtService.sign(accessPayload);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  /**
   * Gera par de tokens (access + refresh) para um usuário
   * @param user - Usuário autenticado
   * @returns Access token e refresh token
   */
  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };
    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload);
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Valida credenciais do usuário
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Usuário se válido, null caso contrário
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
