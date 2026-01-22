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
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'loopt',
  password: process.env.DB_PASSWORD || 'loopt',
  database: process.env.DB_DATABASE || 'loopt',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
