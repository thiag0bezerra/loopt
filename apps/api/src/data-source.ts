import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente do .env
dotenv.config({ path: '../../.env' });

/**
 * Configuração do DataSource para a CLI do TypeORM
 * Usado para gerar e executar migrations
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
