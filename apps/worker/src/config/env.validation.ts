import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, validateSync } from 'class-validator';

/**
 * Enum para ambientes da aplicação
 */
enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Classe de validação das variáveis de ambiente do Worker
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

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
      .map((error) =>
        Object.values(
          (error.constraints as Record<string, string> | undefined) ?? {},
        ).join(', '),
      )
      .join('; ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}
