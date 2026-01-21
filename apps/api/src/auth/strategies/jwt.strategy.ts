import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../auth.service';

/**
 * Estratégia JWT para autenticação via Passport
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Valida o payload do JWT e retorna o usuário
   * @param payload - Payload decodificado do JWT
   * @returns Usuário correspondente ao token
   * @throws UnauthorizedException se usuário não encontrado
   */
  async validate(
    payload: JwtPayload,
  ): Promise<{ id: string; email: string; name: string }> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}
