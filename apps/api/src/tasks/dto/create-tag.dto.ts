import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para criação de uma nova tag
 */
export class CreateTagDto {
  /** Nome da tag (obrigatório, max 50 caracteres) */
  @ApiProperty({
    description: 'Nome da tag',
    example: 'Trabalho',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres' })
  name: string;

  /** Cor da tag em formato hexadecimal (opcional, default: #6366f1) */
  @ApiPropertyOptional({
    description: 'Cor da tag em formato hexadecimal',
    example: '#6366f1',
    default: '#6366f1',
  })
  @IsOptional()
  @IsString({ message: 'A cor deve ser uma string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'A cor deve estar no formato hexadecimal (#RRGGBB)',
  })
  color?: string;
}
