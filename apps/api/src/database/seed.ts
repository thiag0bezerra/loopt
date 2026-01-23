import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Tag } from '../tasks/entities/tag.entity';
import { TaskStatus, TaskPriority } from '@loopt/shared';

// ============================================================================
// CONFIGURAÇÃO DO USUÁRIO DE TESTE
// ============================================================================

/**
 * Dados do usuário de teste
 */
const TEST_USER = {
  email: 'test@loopt.com',
  password: 'test123',
  name: 'João Silva',
};

// ============================================================================
// UTILITÁRIOS DE DATA
// ============================================================================

/**
 * Retorna uma data N dias no passado a partir de hoje
 * @param days Número de dias no passado
 * @param hoursOffset Offset em horas (opcional)
 */
function daysAgo(days: number, hoursOffset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() + hoursOffset);
  return date;
}

/**
 * Retorna uma data N dias no futuro a partir de hoje
 * @param days Número de dias no futuro
 */
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Retorna uma data no passado para createdAt (para simular criação em dias anteriores)
 * @param daysAgoVal Dias no passado
 * @param hour Hora do dia (0-23)
 */
function createdAt(daysAgoVal: number, hour: number = 9): Date {
  const date = daysAgo(daysAgoVal);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/**
 * Retorna uma data de conclusão no passado
 * @param daysAgoVal Dias no passado
 * @param hour Hora do dia (0-23)
 */
function completedAt(daysAgoVal: number, hour: number = 17): Date {
  const date = daysAgo(daysAgoVal);
  date.setHours(hour, 0, 0, 0);
  return date;
}

// ============================================================================
// DADOS DE TESTE - TAGS
// ============================================================================

/**
 * Tags variadas para demonstrar funcionalidades de categorização
 */
const TEST_TAGS = [
  { name: 'Trabalho', color: '#ef4444' }, // Vermelho
  { name: 'Pessoal', color: '#22c55e' }, // Verde
  { name: 'Urgente', color: '#f97316' }, // Laranja
  { name: 'Estudo', color: '#3b82f6' }, // Azul
  { name: 'Saúde', color: '#a855f7' }, // Roxo
  { name: 'Finanças', color: '#eab308' }, // Amarelo
  { name: 'Casa', color: '#06b6d4' }, // Ciano
  { name: 'Projeto X', color: '#ec4899' }, // Rosa
];

// ============================================================================
// DADOS DE TESTE - TAREFAS
// ============================================================================

/**
 * Interface para definição de tarefa de teste
 */
interface TestTask {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  order: number;
  tagNames: string[];
  /** Quantos dias atrás a tarefa foi criada (para simular histórico) */
  createdDaysAgo: number;
  /** Se completada, quantos dias atrás (null se não completada) */
  completedDaysAgo: number | null;
}

/**
 * Tarefas de exemplo abrangentes para demonstrar todas as funcionalidades:
 * - Todos os status (PENDING, IN_PROGRESS, COMPLETED)
 * - Todas as prioridades (LOW, MEDIUM, HIGH)
 * - Com e sem data de vencimento
 * - Atrasadas (overdue)
 * - Vencendo em breve (dueSoon - próximos 3 dias)
 * - Histórico de conclusões em dias diferentes (para gráficos de tendência)
 * - Conclusões em dias da semana diferentes (para dia mais produtivo)
 * - Diferentes tempos de conclusão (para média de tempo)
 * - Múltiplas tags por tarefa
 */
const TEST_TASKS: TestTask[] = [
  // =========================================================================
  // TAREFAS COMPLETADAS (histórico para analytics)
  // =========================================================================

  // Completadas hoje
  {
    title: 'Revisar pull request do João',
    description:
      'Verificar código do novo módulo de autenticação e aprovar ou solicitar mudanças',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(0),
    order: 0,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 1,
    completedDaysAgo: 0,
  },
  {
    title: 'Responder emails importantes',
    description: 'Responder emails pendentes de clientes e stakeholders',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(0),
    order: 1,
    tagNames: ['Trabalho'],
    createdDaysAgo: 0,
    completedDaysAgo: 0,
  },

  // Completadas ontem
  {
    title: 'Preparar apresentação para reunião',
    description:
      'Criar slides sobre progresso do projeto para apresentar na reunião semanal',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(1),
    order: 2,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 3,
    completedDaysAgo: 1,
  },
  {
    title: 'Fazer exercícios matinais',
    description: '30 minutos de alongamento e exercícios aeróbicos',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    order: 3,
    tagNames: ['Pessoal', 'Saúde'],
    createdDaysAgo: 1,
    completedDaysAgo: 1,
  },
  {
    title: 'Estudar capítulo 5 do livro de TypeScript',
    description: 'Estudar generics e utility types com exemplos práticos',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    dueDate: null,
    order: 4,
    tagNames: ['Estudo'],
    createdDaysAgo: 2,
    completedDaysAgo: 1,
  },

  // Completadas há 2 dias
  {
    title: 'Configurar ambiente de desenvolvimento',
    description:
      'Instalar Node.js, Docker e configurar variáveis de ambiente do projeto',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(3),
    order: 5,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 5,
    completedDaysAgo: 2,
  },
  {
    title: 'Pagar contas do mês',
    description: 'Pagar luz, água, internet e cartão de crédito',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(2),
    order: 6,
    tagNames: ['Pessoal', 'Finanças'],
    createdDaysAgo: 5,
    completedDaysAgo: 2,
  },

  // Completadas há 3 dias
  {
    title: 'Reunião de alinhamento com equipe',
    description: 'Discutir prioridades e distribuir tarefas da sprint',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(3),
    order: 7,
    tagNames: ['Trabalho'],
    createdDaysAgo: 4,
    completedDaysAgo: 3,
  },
  {
    title: 'Ir ao mercado',
    description: 'Comprar frutas, verduras e itens básicos para a semana',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    dueDate: daysAgo(3),
    order: 8,
    tagNames: ['Pessoal', 'Casa'],
    createdDaysAgo: 4,
    completedDaysAgo: 3,
  },

  // Completadas há 4 dias
  {
    title: 'Documentar API de autenticação',
    description:
      'Escrever documentação Swagger para endpoints de login, registro e refresh token',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(4),
    order: 9,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 7,
    completedDaysAgo: 4,
  },

  // Completadas há 5 dias
  {
    title: 'Consulta médica de rotina',
    description: 'Check-up anual com clínico geral',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(5),
    order: 10,
    tagNames: ['Pessoal', 'Saúde'],
    createdDaysAgo: 10,
    completedDaysAgo: 5,
  },
  {
    title: 'Implementar testes unitários do módulo de cache',
    description: 'Criar testes para CacheService cobrindo todos os métodos',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(5),
    order: 11,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 8,
    completedDaysAgo: 5,
  },

  // Completadas há 6 dias
  {
    title: 'Revisar orçamento mensal',
    description: 'Analisar gastos do mês e ajustar planejamento financeiro',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(6),
    order: 12,
    tagNames: ['Pessoal', 'Finanças'],
    createdDaysAgo: 8,
    completedDaysAgo: 6,
  },

  // Completadas há 7 dias (semana passada - para comparação week-over-week)
  {
    title: 'Configurar CI/CD no GitHub Actions',
    description: 'Criar workflows para lint, testes e deploy automático',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(7),
    order: 13,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 10,
    completedDaysAgo: 7,
  },

  // Completadas há 8 dias (semana passada)
  {
    title: 'Criar estrutura do monorepo com Turborepo',
    description: 'Configurar workspaces, pipelines e shared packages',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(8),
    order: 14,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 12,
    completedDaysAgo: 8,
  },
  {
    title: 'Limpar e organizar escritório',
    description: 'Organizar mesa, arquivos e descartar itens desnecessários',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    dueDate: null,
    order: 15,
    tagNames: ['Pessoal', 'Casa'],
    createdDaysAgo: 9,
    completedDaysAgo: 8,
  },

  // Completadas há 10 dias (semana passada)
  {
    title: 'Setup inicial do Docker Compose',
    description:
      'Configurar PostgreSQL, Redis e RabbitMQ com healthchecks e volumes',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(10),
    order: 16,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 14,
    completedDaysAgo: 10,
  },

  // =========================================================================
  // TAREFAS EM PROGRESSO
  // =========================================================================
  {
    title: 'Desenvolver dashboard de analytics',
    description:
      'Implementar gráficos de distribuição por status, prioridade e tendência de conclusão',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(2),
    order: 17,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 3,
    completedDaysAgo: null,
  },
  {
    title: 'Estudar React Query para data fetching',
    description:
      'Aprender sobre queries, mutations, cache invalidation e optimistic updates',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(5),
    order: 18,
    tagNames: ['Estudo'],
    createdDaysAgo: 2,
    completedDaysAgo: null,
  },
  {
    title: 'Criar componentes base com shadcn/ui',
    description:
      'Implementar Button, Input, Card, Badge, Dialog e outros componentes base',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(1),
    order: 19,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 2,
    completedDaysAgo: null,
  },
  {
    title: 'Planejar viagem de férias',
    description:
      'Pesquisar destinos, hotéis e montar roteiro para as férias de julho',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.LOW,
    dueDate: daysFromNow(30),
    order: 20,
    tagNames: ['Pessoal'],
    createdDaysAgo: 5,
    completedDaysAgo: null,
  },

  // =========================================================================
  // TAREFAS PENDENTES - VENCENDO EM BREVE (due soon - próximos 3 dias)
  // =========================================================================
  {
    title: 'Entregar relatório semanal',
    description: 'Compilar métricas e escrever resumo das atividades da semana',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(1),
    order: 21,
    tagNames: ['Trabalho'],
    createdDaysAgo: 2,
    completedDaysAgo: null,
  },
  {
    title: 'Agendar dentista',
    description: 'Ligar e marcar consulta de limpeza semestral',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(2),
    order: 22,
    tagNames: ['Pessoal', 'Saúde'],
    createdDaysAgo: 7,
    completedDaysAgo: null,
  },
  {
    title: 'Implementar sistema de notificações',
    description:
      'Criar worker RabbitMQ para processar notificações de tarefas de alta prioridade',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(3),
    order: 23,
    tagNames: ['Trabalho', 'Projeto X', 'Urgente'],
    createdDaysAgo: 1,
    completedDaysAgo: null,
  },

  // =========================================================================
  // TAREFAS PENDENTES - ATRASADAS (overdue)
  // =========================================================================
  {
    title: 'Atualizar currículo',
    description: 'Adicionar experiências recentes e atualizar habilidades',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    dueDate: daysAgo(5),
    order: 24,
    tagNames: ['Pessoal'],
    createdDaysAgo: 15,
    completedDaysAgo: null,
  },
  {
    title: 'Corrigir bug de paginação',
    description:
      'Investigar e corrigir problema onde a última página não exibe todos os itens',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(2),
    order: 25,
    tagNames: ['Trabalho', 'Projeto X', 'Urgente'],
    createdDaysAgo: 5,
    completedDaysAgo: null,
  },
  {
    title: 'Devolver livro na biblioteca',
    description: 'O livro "Clean Code" está atrasado, devolver urgentemente',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(3),
    order: 26,
    tagNames: ['Pessoal', 'Estudo'],
    createdDaysAgo: 20,
    completedDaysAgo: null,
  },

  // =========================================================================
  // TAREFAS PENDENTES - FUTURAS (sem urgência)
  // =========================================================================
  {
    title: 'Implementar dark mode',
    description:
      'Adicionar suporte a tema escuro usando next-themes e CSS variables do shadcn',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(7),
    order: 27,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 1,
    completedDaysAgo: null,
  },
  {
    title: 'Escrever documentação do README',
    description:
      'Documentar instalação, configuração e uso do projeto no README.md',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(10),
    order: 28,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 0,
    completedDaysAgo: null,
  },
  {
    title: 'Aprender Rust',
    description:
      'Começar curso online de Rust para expandir conhecimentos em sistemas',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    dueDate: daysFromNow(60),
    order: 29,
    tagNames: ['Pessoal', 'Estudo'],
    createdDaysAgo: 3,
    completedDaysAgo: null,
  },

  // =========================================================================
  // TAREFAS SEM DATA DE VENCIMENTO
  // =========================================================================
  {
    title: 'Refatorar código legado do módulo de usuários',
    description:
      'Melhorar estrutura, adicionar tipagem e documentação TSDoc ao módulo users',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    dueDate: null,
    order: 30,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 10,
    completedDaysAgo: null,
  },
  {
    title: 'Organizar fotos antigas',
    description: 'Categorizar e fazer backup das fotos dos últimos anos',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    dueDate: null,
    order: 31,
    tagNames: ['Pessoal'],
    createdDaysAgo: 30,
    completedDaysAgo: null,
  },
  {
    title: 'Pesquisar sobre investimentos',
    description:
      'Estudar opções de renda fixa e variável para diversificar portfólio',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    order: 32,
    tagNames: ['Pessoal', 'Finanças', 'Estudo'],
    createdDaysAgo: 14,
    completedDaysAgo: null,
  },
  {
    title: 'Configurar monitoramento com Prometheus/Grafana',
    description:
      'Implementar métricas de aplicação e criar dashboards de monitoramento',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    order: 33,
    tagNames: ['Trabalho'],
    createdDaysAgo: 4,
    completedDaysAgo: null,
  },

  // =========================================================================
  // TAREFAS ADICIONAIS PARA VOLUME
  // =========================================================================
  {
    title: 'Implementar exportação CSV/PDF',
    description:
      'Criar funcionalidade para exportar tarefas em formato CSV e PDF',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(14),
    order: 34,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 0,
    completedDaysAgo: null,
  },
  {
    title: 'Implementar drag and drop no Kanban',
    description:
      'Adicionar funcionalidade de arrastar e soltar tarefas entre colunas',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(5),
    order: 35,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 1,
    completedDaysAgo: null,
  },
  {
    title: 'Fazer backup do computador',
    description: 'Backup completo de documentos e projetos para HD externo',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(7),
    order: 36,
    tagNames: ['Pessoal', 'Casa'],
    createdDaysAgo: 2,
    completedDaysAgo: null,
  },
  {
    title: 'Renovar assinatura da academia',
    description: 'A assinatura vence este mês, renovar para evitar multa',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(15),
    order: 37,
    tagNames: ['Pessoal', 'Saúde', 'Finanças'],
    createdDaysAgo: 5,
    completedDaysAgo: null,
  },
  {
    title: 'Testar integração WebSocket em tempo real',
    description:
      'Verificar se eventos de CRUD de tarefas são propagados corretamente via socket',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(2),
    order: 38,
    tagNames: ['Trabalho', 'Projeto X'],
    createdDaysAgo: 1,
    completedDaysAgo: null,
  },
];

// ============================================================================
// FUNÇÃO PRINCIPAL DE SEED
// ============================================================================

/**
 * Executa o seed do banco de dados
 *
 * Este script RECRIA o usuário de teste e todos os seus dados a cada execução,
 * garantindo um estado limpo e consistente para testes.
 *
 * Dados criados:
 * - 1 usuário de teste com credenciais conhecidas
 * - 8 tags coloridas para categorização
 * - ~40 tarefas cobrindo todos os cenários:
 *   - Diferentes status (PENDING, IN_PROGRESS, COMPLETED)
 *   - Diferentes prioridades (LOW, MEDIUM, HIGH)
 *   - Tarefas atrasadas (overdue)
 *   - Tarefas vencendo em breve (due soon)
 *   - Histórico de conclusões para gráficos de tendência
 *   - Conclusões em diferentes dias da semana
 *   - Múltiplas tags por tarefa
 */
async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');
  console.log('⚠️  Este script RECRIA o usuário de teste a cada execução.\n');

  try {
    // Inicializa a conexão com o banco
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco estabelecida\n');

    const userRepository = AppDataSource.getRepository(User);
    const tagRepository = AppDataSource.getRepository(Tag);
    const taskRepository = AppDataSource.getRepository(Task);

    // ========================================================================
    // PASSO 1: Remove usuário existente (e dados relacionados via CASCADE)
    // ========================================================================
    const existingUser = await userRepository.findOne({
      where: { email: TEST_USER.email },
    });

    if (existingUser) {
      console.log(`🗑️  Removendo usuário existente: ${TEST_USER.email}`);

      // IMPORTANTE: A ordem de deleção é crucial por causa das foreign keys
      // 1. Primeiro remove as tarefas (que têm relação com tags via task_tags)
      await taskRepository.delete({ userId: existingUser.id });

      // 2. Depois remove as tags
      await tagRepository.delete({ userId: existingUser.id });

      // 3. Por fim remove o usuário
      await userRepository.remove(existingUser);

      console.log(`✅ Usuário e dados relacionados removidos\n`);
    }

    // ========================================================================
    // PASSO 2: Cria novo usuário de teste
    // ========================================================================
    console.log('👤 Criando usuário de teste...');

    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    const user = userRepository.create({
      email: TEST_USER.email,
      password: hashedPassword,
      name: TEST_USER.name,
    });
    await userRepository.save(user);

    console.log(`✅ Usuário criado: ${TEST_USER.name} (${TEST_USER.email})\n`);

    // ========================================================================
    // PASSO 3: Cria tags
    // ========================================================================
    console.log('🏷️  Criando tags...');

    const createdTags: Map<string, Tag> = new Map();

    for (const tagData of TEST_TAGS) {
      const tag = tagRepository.create({
        name: tagData.name,
        color: tagData.color,
        userId: user.id,
      });
      const savedTag = await tagRepository.save(tag);
      createdTags.set(tagData.name, savedTag);
      console.log(`   ✅ ${tagData.name} (${tagData.color})`);
    }

    console.log(`\n✅ ${TEST_TAGS.length} tags criadas\n`);

    // ========================================================================
    // PASSO 4: Cria tarefas
    // ========================================================================
    console.log('📋 Criando tarefas...');

    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    for (const taskData of TEST_TASKS) {
      // Encontra as tags associadas a esta tarefa
      const taskTags: Tag[] = [];
      for (const tagName of taskData.tagNames) {
        const tag = createdTags.get(tagName);
        if (tag) {
          taskTags.push(tag);
        }
      }

      // Calcula datas de criação e conclusão
      const taskCreatedAt = createdAt(taskData.createdDaysAgo);
      const taskCompletedAt =
        taskData.completedDaysAgo !== null
          ? completedAt(taskData.completedDaysAgo)
          : null;

      // Cria a tarefa
      const task = taskRepository.create({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        order: taskData.order,
        userId: user.id,
        tags: taskTags,
        completedAt: taskCompletedAt,
      });

      // Salva a tarefa
      await taskRepository.save(task);

      // Atualiza createdAt manualmente (TypeORM gera automaticamente)
      await taskRepository.update(task.id, { createdAt: taskCreatedAt });

      // Contadores para estatísticas
      if (taskData.status === TaskStatus.COMPLETED) {
        completedCount++;
      } else if (taskData.status === TaskStatus.IN_PROGRESS) {
        inProgressCount++;
      } else {
        pendingCount++;

        // Verifica se é overdue ou due soon
        if (taskData.dueDate) {
          if (taskData.dueDate < today) {
            overdueCount++;
          } else if (taskData.dueDate <= threeDaysFromNow) {
            dueSoonCount++;
          }
        }
      }

      console.log(
        `   ✅ ${taskData.title.substring(0, 50)}${taskData.title.length > 50 ? '...' : ''}`,
      );
    }

    // ========================================================================
    // RESUMO FINAL
    // ========================================================================
    console.log('\n========================================');
    console.log('🎉 Seed concluído com sucesso!');
    console.log('========================================\n');

    console.log('📊 Estatísticas:');
    console.log(`   📋 Total de tarefas: ${TEST_TASKS.length}`);
    console.log(`   ✅ Completadas: ${completedCount}`);
    console.log(`   🔄 Em progresso: ${inProgressCount}`);
    console.log(`   ⏳ Pendentes: ${pendingCount}`);
    console.log(`   ⚠️  Atrasadas: ${overdueCount}`);
    console.log(`   ⏰ Vencendo em breve: ${dueSoonCount}`);
    console.log(`   🏷️  Tags: ${TEST_TAGS.length}`);

    console.log('\n📋 Credenciais do usuário de teste:');
    console.log(`   👤 Nome: ${TEST_USER.name}`);
    console.log(`   📧 Email: ${TEST_USER.email}`);
    console.log(`   🔑 Senha: ${TEST_USER.password}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Executa o seed
void seed();
