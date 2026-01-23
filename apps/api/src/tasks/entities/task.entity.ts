import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { TaskStatus, TaskPriority } from '@loopt/shared';
import { User } from '../../users/entities/user.entity';
import { Tag } from './tag.entity';

/**
 * Entidade que representa uma tarefa no banco de dados
 */
@Entity('tasks')
@Index(['userId', 'status'])
@Index(['userId', 'priority'])
export class Task {
  /** Identificador único da tarefa (UUID) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Título da tarefa */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** Descrição da tarefa (opcional) */
  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  /** Status atual da tarefa */
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  /** Prioridade da tarefa */
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  /** Data de vencimento (opcional) */
  @Column({ type: 'timestamp', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  /** ID do usuário proprietário */
  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  /** Relacionamento com o usuário proprietário */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Data de criação do registro */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Data da última atualização do registro */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Data de conclusão (preenchida quando status = COMPLETED) */
  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  /** Ordem da tarefa para reordenação dentro do Kanban (default: 0) */
  @Column({ type: 'int', default: 0 })
  @Index()
  order: number;

  /** Relacionamento ManyToMany com tags */
  @ManyToMany(() => Tag, (tag) => tag.tasks, { cascade: ['insert'] })
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
