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
 * // Obtém o usuário completo
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUserPayload) {
 *   return user;
 * }
 *
 * // Obtém apenas o ID do usuário
 * @Get('tasks')
 * @UseGuards(JwtAuthGuard)
 * getTasks(@CurrentUser('id') userId: string) {
 *   return this.tasksService.findAll(userId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserPayload | undefined,
    ctx: ExecutionContext,
  ): CurrentUserPayload | string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as CurrentUserPayload;

    // Se uma propriedade específica foi solicitada, retorna apenas ela
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
