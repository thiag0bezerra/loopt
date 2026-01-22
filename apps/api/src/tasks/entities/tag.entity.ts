import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

/**
 * Entidade que representa uma tag/categoria para tarefas no banco de dados
 */
@Entity('tags')
@Index(['userId', 'name'], { unique: true })
export class Tag {
  /** Identificador único da tag (UUID) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nome da tag */
  @Column({ type: 'varchar', length: 50 })
  name: string;

  /** Cor da tag em formato hexadecimal */
  @Column({ type: 'varchar', length: 7, default: '#6366f1' })
  color: string;

  /** ID do usuário proprietário */
  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  /** Relacionamento com o usuário proprietário */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Relacionamento ManyToMany com tarefas */
  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];

  /** Data de criação do registro */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Data da última atualização do registro */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
