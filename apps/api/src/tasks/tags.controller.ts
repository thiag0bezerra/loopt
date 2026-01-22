import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto';

/**
 * Controller responsável pelas rotas de tags
 */
@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * Cria uma nova tag
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova tag' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tag criada com sucesso',
    type: Tag,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe uma tag com este nome',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autenticado',
  })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateTagDto,
  ): Promise<Tag> {
    return this.tagsService.create(user.id, dto);
  }

  /**
   * Lista todas as tags do usuário
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas as tags do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tags',
    type: [Tag],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autenticado',
  })
  findAll(@CurrentUser() user: CurrentUserPayload): Promise<Tag[]> {
    return this.tagsService.findAll(user.id);
  }

  /**
   * Busca uma tag específica
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma tag específica' })
  @ApiParam({ name: 'id', description: 'ID da tag (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag encontrada',
    type: Tag,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autenticado',
  })
  findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Tag> {
    return this.tagsService.findOne(user.id, id);
  }

  /**
   * Atualiza uma tag
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma tag' })
  @ApiParam({ name: 'id', description: 'ID da tag (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag atualizada com sucesso',
    type: Tag,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe uma tag com este nome',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autenticado',
  })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ): Promise<Tag> {
    return this.tagsService.update(user.id, id, dto);
  }

  /**
   * Remove uma tag
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma tag' })
  @ApiParam({ name: 'id', description: 'ID da tag (UUID)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tag removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autenticado',
  })
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tagsService.remove(user.id, id);
  }
}
