import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidade que representa um usuário no banco de dados
 */
@Entity('users')
export class User {
  /** Identificador único do usuário (UUID) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Email do usuário (único) */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /** Senha do usuário (hasheada) */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /** Nome do usuário */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Data de criação do registro */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Data da última atualização do registro */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
