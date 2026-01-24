import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

/**
 * Enum para ambientes da aplicação
 */
enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Classe de validação das variáveis de ambiente usando class-validator
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  API_PORT: number = 3000;

  // Database
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  // Redis
  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  // RabbitMQ
  @IsString()
  @IsNotEmpty()
  RABBITMQ_URL!: string;
}

/**
 * Função de validação das variáveis de ambiente
 * @param config - Objeto com as variáveis de ambiente
 * @returns Objeto validado e transformado
 * @throws Error se a validação falhar
 */
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}
