import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto';
import { CacheService } from '../cache';

/**
 * Serviço responsável pela lógica de negócio das tags
 */
@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Cria uma nova tag vinculada ao usuário
   * @param userId ID do usuário proprietário
   * @param dto Dados da tag a ser criada
   * @returns Tag criada
   * @throws ConflictException se já existir uma tag com o mesmo nome para o usuário
   */
  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    // Verifica se já existe uma tag com o mesmo nome para o usuário
    const existingTag = await this.tagsRepository.findOne({
      where: { userId, name: dto.name },
    });

    if (existingTag) {
      throw new ConflictException('Já existe uma tag com este nome');
    }

    const tag = this.tagsRepository.create({
      ...dto,
      userId,
    });

    const savedTag = await this.tagsRepository.save(tag);

    // Invalida cache do usuário após criar tag
    await this.invalidateUserCache(userId);

    return savedTag;
  }

  /**
   * Lista todas as tags do usuário
   * @param userId ID do usuário proprietário
   * @returns Lista de tags do usuário
   */
  async findAll(userId: string): Promise<Tag[]> {
    return this.tagsRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca uma tag específica do usuário
   * @param userId ID do usuário proprietário
   * @param tagId ID da tag
   * @returns Tag encontrada
   * @throws NotFoundException se a tag não for encontrada
   */
  async findOne(userId: string, tagId: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { id: tagId, userId },
    });

    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    return tag;
  }

  /**
   * Busca múltiplas tags por IDs para um usuário
   * @param userId ID do usuário proprietário
   * @param tagIds IDs das tags
   * @returns Tags encontradas
   */
  async findByIds(userId: string, tagIds: string[]): Promise<Tag[]> {
    if (!tagIds || tagIds.length === 0) {
      return [];
    }

    return this.tagsRepository.find({
      where: { id: In(tagIds), userId },
    });
  }

  /**
   * Atualiza uma tag existente
   * @param userId ID do usuário proprietário
   * @param tagId ID da tag
   * @param dto Dados a serem atualizados
   * @returns Tag atualizada
   * @throws NotFoundException se a tag não for encontrada
   * @throws ConflictException se já existir outra tag com o mesmo nome
   */
  async update(userId: string, tagId: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(userId, tagId);

    // Verifica se já existe outra tag com o mesmo nome
    if (dto.name && dto.name !== tag.name) {
      const existingTag = await this.tagsRepository.findOne({
        where: { userId, name: dto.name },
      });

      if (existingTag) {
        throw new ConflictException('Já existe uma tag com este nome');
      }
    }

    Object.assign(tag, dto);
    const savedTag = await this.tagsRepository.save(tag);

    // Invalida cache do usuário após atualizar tag
    await this.invalidateUserCache(userId);

    return savedTag;
  }

  /**
   * Remove uma tag
   * @param userId ID do usuário proprietário
   * @param tagId ID da tag
   * @throws NotFoundException se a tag não for encontrada
   */
  async remove(userId: string, tagId: string): Promise<void> {
    const tag = await this.findOne(userId, tagId);
    await this.tagsRepository.remove(tag);

    // Invalida cache do usuário após remover tag
    await this.invalidateUserCache(userId);
  }

  /**
   * Invalida todas as chaves de cache do usuário relacionadas a tags e tarefas
   * @param userId ID do usuário
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.cacheService.delByPattern(`tasks:${userId}:*`),
      this.cacheService.delByPattern(`analytics:${userId}:*`),
    ]);
  }
}
