import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsOverviewResponse,
  StatusDistribution,
  PriorityDistribution,
  CompletionTrendItem,
  ProductivityMetrics,
} from './dto';

/**
 * Controller responsável pelos endpoints de analytics
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Retorna visão geral das métricas do usuário
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Visão geral das métricas',
    description:
      'Retorna métricas gerais como total de tarefas, taxa de conclusão, tarefas atrasadas, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas retornadas com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getOverview(
    @CurrentUser('id') userId: string,
  ): Promise<AnalyticsOverviewResponse> {
    return this.analyticsService.getOverview(userId);
  }

  /**
   * Retorna distribuição de tarefas por status
   */
  @Get('by-status')
  @ApiOperation({
    summary: 'Distribuição por status',
    description: 'Retorna a contagem de tarefas agrupadas por status',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuição retornada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getByStatus(
    @CurrentUser('id') userId: string,
  ): Promise<StatusDistribution[]> {
    return this.analyticsService.getByStatus(userId);
  }

  /**
   * Retorna distribuição de tarefas por prioridade
   */
  @Get('by-priority')
  @ApiOperation({
    summary: 'Distribuição por prioridade',
    description: 'Retorna a contagem de tarefas agrupadas por prioridade',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuição retornada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getByPriority(
    @CurrentUser('id') userId: string,
  ): Promise<PriorityDistribution[]> {
    return this.analyticsService.getByPriority(userId);
  }

  /**
   * Retorna tendência de conclusão nos últimos dias
   */
  @Get('completion-trend')
  @ApiOperation({
    summary: 'Tendência de conclusão',
    description:
      'Retorna dados de tarefas criadas e concluídas por dia nos últimos N dias',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Número de dias a considerar (padrão: 7)',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'Tendência retornada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getCompletionTrend(
    @CurrentUser('id') userId: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<CompletionTrendItem[]> {
    return this.analyticsService.getCompletionTrend(userId, days);
  }

  /**
   * Retorna métricas de produtividade
   */
  @Get('productivity')
  @ApiOperation({
    summary: 'Métricas de produtividade',
    description:
      'Retorna indicadores como tempo médio de conclusão, streak, comparação semanal, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas de produtividade retornadas com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getProductivity(
    @CurrentUser('id') userId: string,
  ): Promise<ProductivityMetrics> {
    return this.analyticsService.getProductivity(userId);
  }
}
