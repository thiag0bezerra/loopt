import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@loopt/shared';

/**
 * DTO para criação de uma nova tarefa
 */
export class CreateTaskDto {
  /** Título da tarefa (obrigatório, max 255 caracteres) */
  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @IsString({ message: 'O título deve ser uma string' })
  @MaxLength(255, { message: 'O título deve ter no máximo 255 caracteres' })
  title: string;

  /** Descrição da tarefa (opcional, max 1000 caracteres) */
  @ApiPropertyOptional({
    description: 'Descrição da tarefa',
    example: 'Implementar autenticação JWT com refresh token',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  @MaxLength(1000, {
    message: 'A descrição deve ter no máximo 1000 caracteres',
  })
  description?: string;

  /** Status da tarefa (opcional, default: PENDING) */
  @ApiPropertyOptional({
    description: 'Status da tarefa',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status inválido' })
  status?: TaskStatus;

  /** Prioridade da tarefa (opcional, default: MEDIUM) */
  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    example: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridade inválida' })
  priority?: TaskPriority;

  /** Data de vencimento (opcional) */
  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de vencimento inválida' })
  dueDate?: string;

  /** IDs das tags associadas (opcional) */
  @ApiPropertyOptional({
    description: 'IDs das tags a serem associadas à tarefa',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'tagIds deve ser um array' })
  @IsUUID('4', { each: true, message: 'Cada tagId deve ser um UUID válido' })
  tagIds?: string[];
}
