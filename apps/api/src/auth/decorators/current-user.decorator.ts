import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Tipo do usuário retornado pelo decorator */
export interface CurrentUserPayload {
  id: string;
  email: string;
  name: string;
}

/**
 * Decorator para obter o usuário atual da requisição
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUserPayload) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as CurrentUserPayload;
  },
);
