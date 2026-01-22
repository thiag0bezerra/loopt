import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

/**
 * DTO para atualização de uma tarefa existente.
 * Todos os campos são opcionais.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
