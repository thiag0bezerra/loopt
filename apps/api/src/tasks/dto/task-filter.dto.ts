import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsIn,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '@loopt/shared';

/**
 * DTO para filtros de listagem de tarefas
 */
export class TaskFilterDto {
  /** Filtrar por status */
  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status inválido' })
  status?: TaskStatus;

  /** Filtrar por prioridade */
  @ApiPropertyOptional({
    description: 'Filtrar por prioridade',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridade inválida' })
  priority?: TaskPriority;

  /** Busca em título e descrição */
  @ApiPropertyOptional({
    description: 'Buscar em título e descrição',
    example: 'autenticação',
  })
  @IsOptional()
  @IsString()
  search?: string;

  /** Filtrar por tag */
  @ApiPropertyOptional({
    description: 'Filtrar por ID da tag',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'tagId deve ser um UUID válido' })
  tagId?: string;

  /** Número da página (default: 1) */
  @ApiPropertyOptional({
    description: 'Número da página',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser no mínimo 1' })
  page?: number = 1;

  /** Limite por página (default: 10, max: 50) */
  @ApiPropertyOptional({
    description: 'Limite de itens por página',
    default: 10,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser no mínimo 1' })
  @Max(50, { message: 'O limite deve ser no máximo 50' })
  limit?: number = 10;

  /** Campo para ordenação (default: createdAt) */
  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'dueDate', 'title', 'priority', 'status'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority', 'status'], {
    message:
      'Campo de ordenação inválido. Use: createdAt, updatedAt, dueDate, title, priority ou status',
  })
  sortBy?: string = 'createdAt';

  /** Direção da ordenação (default: DESC) */
  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'Direção de ordenação inválida' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
