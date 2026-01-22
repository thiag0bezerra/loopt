import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';

/**
 * DTO para atualização de uma tag existente.
 * Todos os campos são opcionais.
 */
export class UpdateTagDto extends PartialType(CreateTagDto) {}
