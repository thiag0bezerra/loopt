import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para reordenar uma tarefa individual
 */
export class ReorderTaskItemDto {
  @ApiProperty({
    description: 'ID da tarefa (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Nova posição de ordem (0 = primeiro)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  order: number;
}

/**
 * DTO para reordenar múltiplas tarefas em batch
 */
export class ReorderTasksDto {
  @ApiProperty({
    description: 'Lista de tarefas com suas novas posições',
    type: [ReorderTaskItemDto],
    example: [
      { id: '550e8400-e29b-41d4-a716-446655440000', order: 0 },
      { id: '550e8400-e29b-41d4-a716-446655440001', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440002', order: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTaskItemDto)
  tasks: ReorderTaskItemDto[];
}
