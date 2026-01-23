# LOOPT - Planner de Desenvolvimento

## Desafio Técnico | Engenheiro Full Stack Pleno

---

## 📋 Decisões Técnicas

### Monorepo

- **Gerenciador:** Turborepo
- **Package Manager:** pnpm
- **Estrutura de packages:**
  - `apps/api` - Backend NestJS
  - `apps/web` - Frontend Next.js
  - `apps/worker` - Worker RabbitMQ
  - `packages/shared` - Tipos e utilitários compartilhados

### Backend

- **Framework:** NestJS
- **ORM:** TypeORM
- **Validação:** class-validator + class-transformer
- **Testes:** Vitest
- **Documentação:** @nestjs/swagger

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Component Library:** shadcn/ui (Radix UI + Tailwind)
- **Estilização:** TailwindCSS 4 + CSS Variables (theming)
- **Estado Global:** Zustand
- **Data Fetching:** TanStack Query
- **HTTP Client:** Axios
- **Gráficos:** Recharts
- **Testes:** Vitest + Testing Library

### shadcn/ui - Arquitetura

- **Filosofia:** Componentes copiados para o projeto (não é dependência npm)
- **Localização:** `src/components/ui/` (componentes base do shadcn)
- **Primitivos:** Radix UI para acessibilidade e comportamento
- **Theming:** CSS Variables para light/dark mode
- **Componentes planejados:**
  - Button, Input, Label, Card, Badge
  - Dialog, AlertDialog, Sheet (modais e drawers)
  - Select, Checkbox, Form (formulários)
  - Table, Pagination (listagem)
  - Toast/Sonner (notificações)
  - DropdownMenu, Skeleton, Separator

### Infraestrutura

- **Containerização:** Docker Compose
- **Banco de Dados:** PostgreSQL 17
- **Cache:** Redis 7
- **Mensageria:** RabbitMQ 4

### Modelo de Dados

#### User

- id: UUID (PK, gerado automaticamente)
- email: string (unique, not null)
- password: string (hashed, not null)
- name: string (not null)
- createdAt: timestamp (not null)
- updatedAt: timestamp (not null)

#### Task

- id: UUID (PK, gerado automaticamente)
- title: string (not null, max 255)
- description: string (nullable, max 1000)
- status: enum ('pending', 'in_progress', 'completed') (default: 'pending')
- priority: enum ('low', 'medium', 'high') (default: 'medium')
- dueDate: timestamp (nullable)
- userId: UUID (FK -> User, not null)
- createdAt: timestamp (not null)
- updatedAt: timestamp (not null)
- completedAt: timestamp (nullable)

---

## 🔄 Ciclos de Desenvolvimento

---

## CICLO 1: Fundação do Projeto

### Situação

O projeto será iniciado do zero. Será necessária uma estrutura de monorepo bem organizada com configurações compartilhadas e infraestrutura local containerizada.

### Task

Criar a estrutura base do monorepo com Turborepo, configurar Docker Compose com todos os serviços necessários, e estabelecer as configurações compartilhadas.

### Ações

#### 1.1 Inicialização do Monorepo

- [x] Criar diretório do projeto
- [x] Inicializar Git: `git init`
- [x] Criar monorepo Turborepo: `pnpm dlx create-turbo@latest . --package-manager pnpm`
- [x] Remover apps de exemplo gerados pelo template
- [x] Ajustar `turbo.json` com pipelines: build, dev, test, lint, typecheck
- [x] Ajustar `pnpm-workspace.yaml` para incluir apps/_ e packages/_

#### 1.2 Configurações Compartilhadas

- [x] Criar `tsconfig.base.json` na raiz com configurações TypeScript 5 compartilhadas
- [x] Criar configuração ESLint na raiz (eslint.config.mjs - flat config)
- [x] Criar `.prettierrc` na raiz
- [x] Criar `.gitignore` incluindo: node_modules, dist, .env, .turbo, coverage
- [x] Criar `.env.example` com variáveis de ambiente

#### 1.3 Docker Compose

- [x] Criar `docker-compose.yml` com serviços:
  - [x] PostgreSQL 17 (porta 5432, volume para dados)
  - [x] Redis 7 (porta 6379)
  - [x] RabbitMQ 4 com management plugin (portas 5672, 15672)
- [x] Definir healthchecks para cada serviço
- [x] Definir rede interna para comunicação entre serviços
- [x] Criar `docker-compose.prod.yml` para produção

#### 1.4 Package Shared

- [x] Criar diretório `packages/shared`
- [x] Inicializar package: `pnpm init`
- [x] Criar `tsconfig.json` estendendo tsconfig.base.json
- [x] Criar estrutura de diretórios: src/types, src/enums, src/utils
- [x] Criar `src/enums/task-status.enum.ts` com: PENDING, IN_PROGRESS, COMPLETED
- [x] Criar `src/enums/task-priority.enum.ts` com: LOW, MEDIUM, HIGH
- [x] Criar `src/types/user.types.ts` com interfaces User e CreateUser
- [x] Criar `src/types/task.types.ts` com interfaces Task, CreateTask, UpdateTask
- [x] Criar `src/types/api.types.ts` com interfaces de response padrão (ApiResponse, PaginatedResponse)
- [x] Criar `src/index.ts` exportando todos os tipos e enums
- [x] Configurar package.json com exports e main apontando para src/index.ts

### Resultado Esperado

Monorepo funcional com Turborepo, Docker Compose rodando PostgreSQL, Redis e RabbitMQ, e package shared pronto para ser consumido pelos apps.

### Checklist de Validação

- [ ] `pnpm install` executa sem erros
- [ ] `docker compose up -d` inicia todos os serviços sem erros
- [ ] PostgreSQL acessível: `docker compose exec postgres psql -U loopt -d loopt -c '\l'`
- [ ] Redis acessível: `docker compose exec redis redis-cli ping` retorna PONG
- [ ] RabbitMQ Management acessível em http://localhost:15672 (guest/guest)
- [ ] `pnpm --filter @loopt/shared build` compila sem erros

---

## CICLO 2: Backend - Estrutura Base e Autenticação

### Situação

Com a infraestrutura pronta, o backend será desenvolvido. A autenticação é a base do sistema, pois todas as rotas de tarefas dependem do usuário autenticado.

### Task

Criar a aplicação NestJS com módulos de configuração, banco de dados, e sistema completo de autenticação JWT.

### Ações

#### 2.1 Inicialização NestJS

- [x] Criar app NestJS: `pnpm dlx @nestjs/cli@latest new api --directory apps/api --package-manager pnpm --skip-git`
- [x] Remover arquivos de teste gerados (app.controller.spec.ts, etc.)
- [x] Adicionar dependência do @loopt/shared no package.json
- [x] Criar `tsconfig.json` estendendo tsconfig.base.json da raiz
- [x] Instalar dependências de configuração: `pnpm add @nestjs/config`
- [x] Instalar dependências de banco: `pnpm add @nestjs/typeorm typeorm pg`
- [x] Instalar dependências de auth: `pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`
- [x] Instalar dependências de validação: `pnpm add class-validator class-transformer`
- [x] Instalar dependências de documentação: `pnpm add @nestjs/swagger`
- [x] Instalar tipos: `pnpm add -D @types/passport-jwt @types/bcrypt`
- [x] Configurar ValidationPipe global no main.ts
- [x] Configurar Swagger no main.ts

#### 2.2 Módulo de Configuração

- [x] Configurar ConfigModule.forRoot() como global em app.module.ts
- [x] Criar arquivo de validação de variáveis de ambiente com class-validator

#### 2.3 Módulo de Banco de Dados

- [x] Configurar TypeOrmModule.forRootAsync() em app.module.ts
- [x] Configurar conexão PostgreSQL via variáveis de ambiente
- [x] Desabilitar synchronize (usar migrations)
- [x] Configurar logging de queries em desenvolvimento
- [x] Criar diretório src/database/migrations
- [x] Configurar TypeORM CLI para migrations no package.json

#### 2.4 Entity User

- [x] Criar diretório src/users
- [x] Criar entity User em src/users/entities/user.entity.ts
- [x] Definir campos: id (UUID PrimaryGeneratedColumn), email, password, name, createdAt, updatedAt
- [x] Adicionar constraint unique no email
- [x] Adicionar decorators de validação
- [x] Criar migration inicial: `pnpm typeorm migration:generate src/database/migrations/CreateUsers`

#### 2.5 Módulo Users

- [x] Criar UsersModule em src/users/users.module.ts
- [x] Criar UsersService em src/users/users.service.ts
- [x] Implementar método findByEmail(email: string)
- [x] Implementar método findById(id: string)
- [x] Implementar método create(data: CreateUserDto)
- [x] Exportar UsersService para uso em AuthModule

#### 2.6 Módulo Auth

- [x] Criar diretório src/auth
- [x] Criar AuthModule em src/auth/auth.module.ts
- [x] Criar AuthService em src/auth/auth.service.ts
- [x] Criar DTOs com validação:
  - [x] RegisterDto: name (string, not empty), email (email válido), password (min 6 caracteres)
  - [x] LoginDto: email (email válido), password (string, not empty)
- [x] Implementar AuthService.register(): validar email único, hashear senha com bcrypt, criar usuário
- [x] Implementar AuthService.login(): validar credenciais, gerar JWT
- [x] Implementar AuthService.validateUser(): buscar usuário e comparar senha
- [x] Implementar refresh token:
  - [x] Criar RefreshTokenDto
  - [x] Gerar refreshToken com expiração maior (7 dias)
  - [x] Implementar AuthService.refreshToken(): validar refresh token, gerar novo access token
  - [x] Implementar POST /auth/refresh no controller

#### 2.7 JWT Strategy

- [x] Criar JwtStrategy em src/auth/strategies/jwt.strategy.ts
- [x] Configurar extração do token do header Authorization Bearer
- [x] Configurar validação do payload e retorno do usuário
- [x] Criar JwtAuthGuard em src/auth/guards/jwt-auth.guard.ts
- [x] Criar decorator @CurrentUser() em src/auth/decorators/current-user.decorator.ts
- [x] Configurar JwtModule.registerAsync() com secret e expiresIn do .env

#### 2.8 Controller Auth

- [x] Criar AuthController em src/auth/auth.controller.ts
- [x] Implementar POST /auth/register: rota pública, retorna usuário criado (sem senha)
- [x] Implementar POST /auth/login: rota pública, retorna { accessToken, user }
- [x] Implementar GET /auth/me: rota protegida com JwtAuthGuard, retorna usuário atual
- [x] Adicionar decorators Swagger em todos os endpoints (@ApiTags, @ApiOperation, @ApiResponse)

#### 2.9 Testes Auth

- [x] Configurar Vitest no apps/api
- [x] Criar src/auth/auth.service.spec.ts
- [x] Teste: register cria usuário com senha hasheada
- [x] Teste: register rejeita email duplicado
- [x] Teste: login retorna token para credenciais válidas
- [x] Teste: login rejeita credenciais inválidas

### Resultado Esperado

API com endpoints funcionais de registro e login retornando JWT válido. Swagger acessível em /api documentando os endpoints. Proteção de rotas funcionando com JwtAuthGuard.

### Checklist de Validação

- [ ] Migration executada: `pnpm --filter api typeorm migration:run`
- [ ] POST /auth/register cria usuário e retorna dados (sem campo password)
- [ ] POST /auth/register retorna 409 para email duplicado
- [ ] POST /auth/login retorna { accessToken, user } para credenciais válidas
- [ ] POST /auth/login retorna 401 para credenciais inválidas
- [ ] GET /auth/me retorna dados do usuário com token válido no header
- [ ] GET /auth/me retorna 401 sem token
- [ ] Swagger acessível em http://localhost:3001/api
- [ ] `pnpm --filter api test` executa testes sem falhas

---

## CICLO 3: Backend - CRUD de Tarefas

### Situação

Com autenticação funcional, o próximo passo é implementar o core da aplicação: gerenciamento completo de tarefas com filtros, paginação e ordenação.

### Task

Implementar o módulo de tarefas com CRUD completo, garantindo que usuários só acessem suas próprias tarefas.

### Ações

#### 3.1 Entity Task

- [x] Criar diretório src/tasks
- [x] Criar entity Task em src/tasks/entities/task.entity.ts
- [x] Definir campos conforme modelo de dados
- [x] Criar relacionamento ManyToOne com User (userId como FK)
- [x] Adicionar índices em userId, status, priority para otimização de queries
- [x] Criar migration: `pnpm typeorm migration:generate src/database/migrations/CreateTasks`
- [x] Executar migration

#### 3.2 DTOs Task

- [x] Criar CreateTaskDto em src/tasks/dto/create-task.dto.ts:
  - [x] title: string (IsNotEmpty, MaxLength 255)
  - [x] description: string opcional (MaxLength 1000)
  - [x] status: TaskStatus opcional (IsEnum, default PENDING)
  - [x] priority: TaskPriority opcional (IsEnum, default MEDIUM)
  - [x] dueDate: Date opcional (IsDateString)
- [x] Criar UpdateTaskDto em src/tasks/dto/update-task.dto.ts usando PartialType(CreateTaskDto)
- [x] Criar TaskFilterDto em src/tasks/dto/task-filter.dto.ts:
  - [x] status: TaskStatus opcional
  - [x] priority: TaskPriority opcional
  - [x] search: string opcional (busca em título e descrição)
  - [x] page: number (default 1, Min 1)
  - [x] limit: number (default 10, Min 1, Max 50)
  - [x] sortBy: string (default 'createdAt')
  - [x] sortOrder: 'ASC' | 'DESC' (default 'DESC')

#### 3.3 TasksService

- [x] Criar TasksModule em src/tasks/tasks.module.ts
- [x] Criar TasksService em src/tasks/tasks.service.ts
- [x] Implementar create(userId: string, dto: CreateTaskDto): criar tarefa vinculada ao usuário
- [x] Implementar findAll(userId: string, filters: TaskFilterDto): retornar PaginatedResponse
  - [x] Aplicar filtro por status se fornecido
  - [x] Aplicar filtro por priority se fornecido
  - [x] Aplicar busca ILIKE em title e description se search fornecido
  - [x] Aplicar ordenação por sortBy e sortOrder
  - [x] Aplicar paginação com skip e take
  - [x] Retornar { data, meta: { total, page, limit, totalPages } }
- [x] Implementar findOne(userId: string, taskId: string): buscar tarefa ou lançar NotFoundException
- [x] Implementar update(userId: string, taskId: string, dto: UpdateTaskDto):
  - [x] Buscar tarefa (validar ownership)
  - [x] Se status mudando para COMPLETED, preencher completedAt
  - [x] Se status mudando de COMPLETED para outro, limpar completedAt
  - [x] Salvar e retornar tarefa atualizada
- [x] Implementar remove(userId: string, taskId: string): deletar tarefa ou lançar NotFoundException

#### 3.4 TasksController

- [x] Criar TasksController em src/tasks/tasks.controller.ts
- [x] Aplicar @UseGuards(JwtAuthGuard) no controller
- [x] Implementar POST /tasks: criar tarefa, retornar 201
- [x] Implementar GET /tasks: listar tarefas com query params do TaskFilterDto
- [x] Implementar GET /tasks/:id: buscar tarefa específica
- [x] Implementar PATCH /tasks/:id: atualizar tarefa
- [x] Implementar DELETE /tasks/:id: deletar tarefa, retornar 204
- [x] Adicionar decorators Swagger em todos os endpoints

#### 3.5 Testes Tasks

- [x] Criar src/tasks/tasks.service.spec.ts
- [x] Teste: create cria tarefa vinculada ao usuário
- [x] Teste: findAll retorna apenas tarefas do usuário
- [x] Teste: findAll aplica filtros corretamente
- [x] Teste: update atualiza campos e preenche completedAt quando status = COMPLETED
- [x] Teste: remove deleta tarefa existente

#### 3.6 Entity Tag (Categorias)

- [x] Criar entity Tag em src/tasks/entities/tag.entity.ts:
  - [x] id: UUID (PK)
  - [x] name: string (not null, max 50)
  - [x] color: string (hex color, default #6366f1)
  - [x] userId: UUID (FK -> User)
  - [x] Relacionamento ManyToMany com Task
- [x] Criar migration para Tag e tabela de junção task_tags
- [x] Criar CreateTagDto e UpdateTagDto
- [x] Implementar CRUD de tags no TasksService ou TagsService separado:
  - [x] POST /tags: criar tag do usuário
  - [x] GET /tags: listar tags do usuário
  - [x] PATCH /tags/:id: atualizar tag
  - [x] DELETE /tags/:id: deletar tag
- [x] Atualizar CreateTaskDto e UpdateTaskDto para incluir tagIds: string[]
- [x] Atualizar TasksService para associar tags às tarefas
- [x] Atualizar TaskFilterDto para incluir filtro por tagId

### Resultado Esperado

API com CRUD completo de tarefas funcionando. Usuários autenticados podem criar, listar, atualizar e deletar suas tarefas. Listagem suporta filtros, busca, paginação e ordenação.

### Checklist de Validação

- [ ] POST /tasks cria tarefa vinculada ao usuário autenticado
- [ ] GET /tasks retorna apenas tarefas do usuário autenticado
- [ ] GET /tasks?status=pending filtra por status
- [ ] GET /tasks?priority=high filtra por prioridade
- [ ] GET /tasks?search=termo busca em título e descrição
- [ ] GET /tasks?page=2&limit=5 pagina corretamente
- [ ] GET /tasks?sortBy=dueDate&sortOrder=ASC ordena corretamente
- [ ] GET /tasks/:id retorna tarefa ou 404
- [ ] PATCH /tasks/:id atualiza apenas campos enviados
- [ ] PATCH /tasks/:id com status=completed preenche completedAt
- [ ] DELETE /tasks/:id remove tarefa e retorna 204
- [ ] Acessar tarefa de outro usuário retorna 404
- [ ] `pnpm --filter api test` executa sem falhas

---

## CICLO 4: Backend - Cache com Redis

### Situação

O CRUD está funcional, mas cada requisição consulta o banco. Para otimizar performance, será implementado cache com Redis nas operações de leitura.

### Task

Integrar Redis ao backend, implementando cache na listagem de tarefas e endpoints de analytics, com invalidação automática.

### Ações

#### 4.1 Configuração Redis

- [x] Instalar dependências: `pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-yet`
- [x] Criar CacheModule em src/cache/cache.module.ts
- [x] Configurar CacheModule.registerAsync() com Redis store
- [x] Exportar CacheModule como global

#### 4.2 CacheService

- [x] Criar CacheService em src/cache/cache.service.ts
- [x] Injetar CACHE_MANAGER
- [x] Implementar get<T>(key: string): Promise<T | undefined>
- [x] Implementar set(key: string, value: unknown, ttl?: number): Promise<void>
- [x] Implementar del(key: string): Promise<void>
- [x] Implementar delByPattern(pattern: string): Promise<void> usando scan do Redis
- [x] Adicionar logs para debug de cache hits/misses

#### 4.3 Cache na Listagem de Tarefas

- [x] Criar função para gerar chave de cache: `tasks:${userId}:${JSON.stringify(filters)}`
- [x] No TasksService.findAll:
  - [x] Verificar cache antes de consultar banco
  - [x] Se cache hit, retornar dados do cache
  - [x] Se cache miss, consultar banco e salvar no cache com TTL 300 (5 minutos)

#### 4.4 Invalidação de Cache

- [x] Criar método privado invalidateUserCache(userId: string) no TasksService
- [x] Usar delByPattern para invalidar todas as chaves `tasks:${userId}:*`
- [x] Chamar invalidateUserCache em:
  - [x] TasksService.create após criar tarefa
  - [x] TasksService.update após atualizar tarefa
  - [x] TasksService.remove após deletar tarefa

### Resultado Esperado

Requisições de listagem servidas do cache quando disponível. Qualquer modificação em tarefas invalida o cache automaticamente.

### Checklist de Validação

- [ ] Primeira requisição GET /tasks consulta banco e salva no cache
- [ ] Segunda requisição GET /tasks (mesmos filtros) retorna do cache (verificar logs)
- [ ] Requisição com filtros diferentes cria nova entrada no cache
- [ ] POST /tasks invalida cache do usuário
- [ ] PATCH /tasks/:id invalida cache do usuário
- [ ] DELETE /tasks/:id invalida cache do usuário
- [ ] Cache expira após 5 minutos

---

## CICLO 5: Backend - Sistema de Notificações (RabbitMQ)

### Situação

Tarefas de alta prioridade requerem atenção especial. Será implementado um sistema de notificações assíncronas usando RabbitMQ com worker separado.

### Task

Criar integração com RabbitMQ para enviar mensagens quando tarefas de alta prioridade forem criadas, e implementar worker separado para processar as mensagens.

### Ações

#### 5.1 Configuração RabbitMQ no Backend

- [x] Instalar dependências: `pnpm add @nestjs/microservices amqplib amqp-connection-manager`
- [x] Instalar tipos: `pnpm add -D @types/amqplib`
- [x] Criar NotificationsModule em src/notifications/notifications.module.ts
- [x] Configurar ClientsModule.registerAsync() com RabbitMQ transport
- [x] Definir nome da queue: high-priority-tasks

#### 5.2 NotificationsService

- [x] Criar NotificationsService em src/notifications/notifications.service.ts
- [x] Injetar ClientProxy do RabbitMQ
- [x] Criar interface TaskNotificationPayload com: taskId, taskTitle, userId, userEmail, userName, createdAt
- [x] Implementar sendHighPriorityNotification(task: Task, user: User): void
  - [x] Montar payload
  - [x] Emitir mensagem com pattern 'task.created.high'

#### 5.3 Integração no TasksService

- [x] Injetar NotificationsService no TasksService
- [x] No método create, após salvar tarefa:
  - [x] Se priority === HIGH, chamar sendHighPriorityNotification

#### 5.4 Worker Separado

- [x] Criar app worker: `pnpm dlx @nestjs/cli@latest new worker --directory apps/worker --package-manager pnpm --skip-git`
- [x] Remover arquivos desnecessários
- [x] Adicionar dependência do @loopt/shared
- [x] Instalar: `pnpm add @nestjs/microservices amqplib amqp-connection-manager @nestjs/config`
- [x] Configurar main.ts como microservice (não HTTP)
- [x] Conectar ao RabbitMQ via Transport.RMQ
- [x] Criar NotificationConsumerService em src/notification-consumer.service.ts
- [x] Implementar handler com @MessagePattern('task.created.high')
- [x] Processar mensagem: logar no console simulando envio de notificação
- [x] Implementar tratamento de erros com try/catch
- [x] Adicionar script de start no package.json

#### 5.5 Docker Compose

- [x] Adicionar serviço worker no docker-compose.yml
- [x] Configurar dependência do RabbitMQ
- [x] Configurar variáveis de ambiente

### Resultado Esperado

Ao criar tarefa com prioridade alta, mensagem é publicada no RabbitMQ. Worker separado consome e processa (logando como simulação).

### Checklist de Validação

- [ ] Criar tarefa com priority=high publica mensagem na queue
- [ ] Criar tarefa com priority=low ou medium não publica
- [ ] Worker recebe mensagem e loga no console
- [ ] Worker continua funcionando após processar mensagem
- [ ] `docker compose up` inicia api e worker

---

## CICLO 6: Backend - Analytics e Métricas

### Situação

O dashboard de produtividade precisa de dados. Serão criados endpoints de analytics com métricas agregadas e dados para gráficos.

### Task

Implementar módulo de analytics com endpoints para métricas gerais, distribuições e tendências, todos com cache.

### Ações

#### 6.1 Módulo Analytics

- [x] Criar diretório src/analytics
- [x] Criar AnalyticsModule em src/analytics/analytics.module.ts
- [x] Importar TypeOrmModule.forFeature([Task])
- [x] Importar CacheModule

#### 6.2 AnalyticsService

- [x] Criar AnalyticsService em src/analytics/analytics.service.ts
- [x] Injetar Repository<Task> e CacheService

#### 6.3 Endpoint Overview

- [x] Implementar getOverview(userId: string) retornando:
  - [x] totalTasks: número total de tarefas
  - [x] completedTasks: tarefas com status COMPLETED
  - [x] pendingTasks: tarefas com status PENDING
  - [x] inProgressTasks: tarefas com status IN_PROGRESS
  - [x] completionRate: (completedTasks / totalTasks) \* 100
  - [x] overdueTasks: tarefas com dueDate < hoje e status != COMPLETED
  - [x] dueSoon: tarefas com dueDate nos próximos 3 dias e status != COMPLETED
- [x] Aplicar cache com chave `analytics:${userId}:overview` e TTL 300

#### 6.4 Endpoint By Status

- [x] Implementar getByStatus(userId: string) retornando array:
  - [x] { status: 'pending', count: number }
  - [x] { status: 'in_progress', count: number }
  - [x] { status: 'completed', count: number }
- [x] Usar GROUP BY status na query
- [x] Aplicar cache com chave `analytics:${userId}:by-status` e TTL 300

#### 6.5 Endpoint By Priority

- [x] Implementar getByPriority(userId: string) retornando array:
  - [x] { priority: 'low', count: number }
  - [x] { priority: 'medium', count: number }
  - [x] { priority: 'high', count: number }
- [x] Usar GROUP BY priority na query
- [x] Aplicar cache com chave `analytics:${userId}:by-priority` e TTL 300

#### 6.6 Endpoint Completion Trend

- [x] Implementar getCompletionTrend(userId: string, days: number = 7) retornando array:
  - [x] { date: 'YYYY-MM-DD', completed: number, created: number }
- [x] Gerar array com últimos N dias
- [x] Contar tarefas criadas por dia (usando createdAt)
- [x] Contar tarefas completadas por dia (usando completedAt)
- [x] Aplicar cache com chave `analytics:${userId}:trend:${days}` e TTL 300

#### 6.7 Endpoint Productivity

- [x] Implementar getProductivity(userId: string) retornando:
  - [x] averageCompletionTime: média em horas de (completedAt - createdAt) para tarefas completadas
  - [x] tasksCompletedThisWeek: tarefas completadas na semana atual
  - [x] tasksCompletedLastWeek: tarefas completadas na semana anterior
  - [x] weekOverWeekChange: ((thisWeek - lastWeek) / lastWeek) \* 100
  - [x] streakDays: dias consecutivos (até hoje) com pelo menos 1 tarefa completada
  - [x] mostProductiveDay: dia da semana com mais tarefas completadas
- [x] Aplicar cache com chave `analytics:${userId}:productivity` e TTL 300

#### 6.8 AnalyticsController

- [x] Criar AnalyticsController em src/analytics/analytics.controller.ts
- [x] Aplicar @UseGuards(JwtAuthGuard)
- [x] Implementar GET /analytics/overview
- [x] Implementar GET /analytics/by-status
- [x] Implementar GET /analytics/by-priority
- [x] Implementar GET /analytics/completion-trend com query param days opcional
- [x] Implementar GET /analytics/productivity
- [x] Adicionar decorators Swagger

#### 6.9 Invalidação de Cache Analytics

- [x] No TasksService, adicionar invalidação das chaves de analytics:
  - [x] Invalidar `analytics:${userId}:*` em create, update e remove

### Resultado Esperado

Frontend terá endpoints ricos para construir o dashboard. Todos os dados estarão em cache para performance.

### Checklist de Validação

- [ ] GET /analytics/overview retorna métricas corretas
- [ ] GET /analytics/by-status retorna distribuição por status
- [ ] GET /analytics/by-priority retorna distribuição por prioridade
- [ ] GET /analytics/completion-trend retorna dados dos últimos dias
- [ ] GET /analytics/productivity retorna indicadores calculados
- [ ] Todas as respostas estão em cache
- [ ] Modificar tarefa invalida cache de analytics
- [ ] Swagger documenta todos os endpoints

---

## CICLO 6.5: Backend - Websockets para Atualizações em Tempo Real

### Situação

Para melhorar a experiência do usuário, mudanças em tarefas devem ser refletidas em tempo real sem necessidade de refresh manual.

### Task

Implementar Websockets com Socket.IO para notificar clientes sobre mudanças em tarefas.

### Ações

#### 6.5.1 Configuração Websockets no Backend

- [x] Instalar dependências: `pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io`
- [x] Criar TasksGateway em src/tasks/tasks.gateway.ts
- [x] Configurar WebSocketGateway com namespace /tasks
- [x] Implementar autenticação JWT no handshake do socket
- [x] Criar room por userId para isolar eventos

#### 6.5.2 Eventos de Websocket

- [x] Emitir evento 'task:created' ao criar tarefa
- [x] Emitir evento 'task:updated' ao atualizar tarefa
- [x] Emitir evento 'task:deleted' ao deletar tarefa
- [x] Payload dos eventos: { task, action }

#### 6.5.3 Integração no TasksService

- [x] Injetar TasksGateway no TasksService
- [x] Chamar gateway.emitToUser(userId, event, payload) em create, update, remove

### Resultado Esperado

Clientes conectados via Websocket recebem atualizações em tempo real quando tarefas são modificadas.

### Checklist de Validação

- [ ] Conexão websocket estabelecida com autenticação
- [ ] Criar tarefa emite evento para cliente
- [ ] Atualizar tarefa emite evento para cliente
- [ ] Deletar tarefa emite evento para cliente
- [ ] Eventos são isolados por usuário

---

## CICLO 7: Frontend - Estrutura Base e Autenticação

### Situação

O backend está completo. O frontend será iniciado com Next.js, configurando a estrutura base e sistema de autenticação.

### Task

Criar a aplicação Next.js com App Router, configurar dependências, implementar páginas de login/registro e sistema de rotas protegidas.

### Ações

#### 7.1 Inicialização Next.js

- [x] Criar app Next.js: `pnpm dlx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [x] Adicionar dependência do @loopt/shared no package.json
- [x] Instalar dependências de estado: `pnpm add zustand`
- [x] Instalar dependências de data fetching: `pnpm add @tanstack/react-query`
- [x] Instalar dependências HTTP: `pnpm add axios`
- [x] Instalar dependências de formulário: `pnpm add react-hook-form @hookform/resolvers zod`
- [x] Instalar dependências de gráficos: `pnpm add recharts`
- [x] Configurar path aliases no tsconfig.json

#### 7.2 Configuração shadcn/ui

- [x] Inicializar shadcn: `pnpm dlx shadcn@latest init`
  - [x] Style: Default
  - [x] Base color: Slate (ou preferência)
  - [x] CSS variables: Yes (obrigatório para theming)
  - [x] Tailwind config: tailwind.config.ts
  - [x] Components path: src/components/ui
  - [x] Utils path: src/lib/utils
- [x] Instalar componentes base: `pnpm dlx shadcn@latest add button input label card badge`
- [x] Instalar componentes de formulário: `pnpm dlx shadcn@latest add form select checkbox`
- [x] Instalar componentes de modal: `pnpm dlx shadcn@latest add dialog alert-dialog sheet`
- [x] Instalar componentes de feedback: `pnpm dlx shadcn@latest add toast sonner skeleton`
- [x] Instalar componentes de navegação: `pnpm dlx shadcn@latest add dropdown-menu separator`
- [x] Instalar componentes de tabela: `pnpm dlx shadcn@latest add table pagination`
- [x] Verificar que lucide-react foi instalado como dependência do shadcn
- [x] Configurar globals.css com CSS variables do shadcn (light e dark themes)

#### 7.3 Configuração Storybook

- [x] Instalar Storybook: `pnpm dlx storybook@latest init`
- [x] Configurar para Next.js e TailwindCSS
- [x] Criar src/stories/ para organização
- [x] Configurar .storybook/preview.ts para carregar globals.css e CSS variables do shadcn
- [x] Configurar dark mode toggle no Storybook (addon-themes ou backgrounds)
- [x] Criar stories para componentes base instalados:
  - [x] Button.stories.tsx (variants: default, destructive, outline, secondary, ghost, link)
  - [x] Input.stories.tsx (states: default, disabled, with error)
  - [x] Card.stories.tsx (composição: CardHeader, CardContent, CardFooter)
  - [x] Badge.stories.tsx (variants: default, secondary, destructive, outline)
- [x] Adicionar script no package.json: `"storybook": "storybook dev -p 6006"`

#### 7.4 Configuração de API Client

- [x] Criar src/lib/api.ts
- [x] Criar instância Axios com baseURL do NEXT_PUBLIC_API_URL
- [x] Criar interceptor de request para adicionar token do localStorage
- [x] Criar interceptor de response para tratar 401 (limpar auth e redirecionar para /login)

#### 7.5 Providers

- [x] Criar src/providers/query-provider.tsx com QueryClientProvider
- [x] Configurar defaultOptions: queries (staleTime: 5 minutos, retry: 1)
- [x] Criar src/providers/toast-provider.tsx para Sonner/Toast do shadcn
- [x] Criar src/app/providers.tsx combinando providers
- [x] Envolver children em layout.tsx com providers

#### 7.6 Store de Autenticação (Zustand)

- [x] Criar src/stores/auth.store.ts
- [x] Definir interface AuthState: user, token, isAuthenticated, setAuth, logout, hydrate
- [x] Implementar setAuth: salvar user e token no state e localStorage
- [x] Implementar logout: limpar state e localStorage, redirecionar para /login
- [x] Implementar hydrate: carregar token do localStorage e buscar usuário da API
- [x] Usar persist middleware do Zustand para token

#### 7.7 Hooks de Autenticação

- [x] Criar src/hooks/use-auth.ts
- [x] Implementar useLogin: mutation que chama POST /auth/login, onSuccess chama setAuth (salva accessToken e refreshToken)
- [x] Implementar useRegister: mutation que chama POST /auth/register, onSuccess chama setAuth
- [x] Implementar useCurrentUser: query que chama GET /auth/me, enabled quando tem token
- [x] Implementar useRefreshToken: mutation que chama POST /auth/refresh com refreshToken

#### 7.8 Página de Login (usando shadcn/ui)

- [x] Criar src/app/(auth)/login/page.tsx
- [x] Usar componentes shadcn: Card, CardHeader, CardContent, CardFooter
- [x] Usar shadcn Form com react-hook-form e validação zod
- [x] Usar shadcn Input e Label para campos
- [x] Campos: email (required, email), password (required, min 6)
- [x] Usar shadcn Button com loading state (disabled + ícone Loader2)
- [x] Exibir mensagens de erro usando FormMessage do shadcn
- [x] Link para página de registro
- [x] onSuccess: redirecionar para /tasks, mostrar toast de sucesso

#### 7.9 Página de Registro (usando shadcn/ui)

- [x] Criar src/app/(auth)/register/page.tsx
- [x] Usar componentes shadcn: Card, CardHeader, CardContent, CardFooter
- [x] Usar shadcn Form com react-hook-form e validação zod
- [x] Usar shadcn Input e Label para campos
- [x] Campos: name (required), email (required, email), password (required, min 6), confirmPassword (deve ser igual a password)
- [x] Usar shadcn Button com loading state
- [x] Exibir mensagens de erro usando FormMessage do shadcn
- [x] Link para página de login
- [x] onSuccess: redirecionar para /tasks, mostrar toast de sucesso

#### 7.10 Layout de Auth

- [x] Criar src/app/(auth)/layout.tsx
- [x] Layout centralizado e minimalista (flex center)
- [x] Logo/título do app com ícone lucide-react
- [x] Background com cores CSS variables (funciona em dark mode)
- [x] Redirecionar para /tasks se já autenticado

#### 7.11 Proteção de Rotas

- [x] Criar src/components/auth/protected-route.tsx
- [x] Verificar isAuthenticated do store
- [x] Se não autenticado, redirecionar para /login
- [x] Mostrar loading com shadcn Skeleton enquanto hidrata estado
- [x] Criar src/app/(protected)/layout.tsx usando ProtectedRoute
- [x] Integrar refresh token no interceptor do Axios (renovar token automaticamente ao receber 401)

### Resultado Esperado

Frontend com páginas funcionais de login e registro conectadas à API. Sistema de rotas protegidas funcional. Estado de autenticação gerenciado com Zustand.

### Checklist de Validação

- [ ] Página /login renderiza formulário
- [ ] Validação de formulário funciona (campos required, email válido, etc.)
- [ ] Login com credenciais válidas redireciona para /tasks
- [ ] Login com credenciais inválidas mostra mensagem de erro
- [ ] Página /register cria usuário e redireciona para /tasks
- [ ] Token é persistido no localStorage
- [ ] Refresh da página mantém usuário logado (hydrate funciona)
- [ ] Acessar /tasks sem autenticação redireciona para /login
- [ ] Acessar /login já autenticado redireciona para /tasks

---

## CICLO 8: Frontend - Gestão de Tarefas

### Situação

Usuários autenticados precisam gerenciar suas tarefas. Esta é a página principal com todas as operações CRUD.

### Task

Implementar a página de gestão de tarefas com listagem, criação, edição, exclusão, filtros, ordenação e paginação.

### Ações

#### 8.1 Hooks de Tarefas

- [x] Criar src/hooks/use-tasks.ts
- [x] Implementar useTasks(filters): query GET /tasks com query params
- [x] Implementar useTask(id): query GET /tasks/:id
- [x] Implementar useCreateTask: mutation POST /tasks, invalidate useTasks
- [x] Implementar useUpdateTask: mutation PATCH /tasks/:id, invalidate useTasks e useTask
- [x] Implementar useDeleteTask: mutation DELETE /tasks/:id, invalidate useTasks
- [x] Implementar useTasksWebsocket: conectar ao socket e invalidar queries ao receber eventos
  - [x] Instalar dependência: `pnpm add socket.io-client`
  - [x] Conectar ao namespace /tasks com token JWT
  - [x] Ouvir eventos task:created, task:updated, task:deleted
  - [x] Invalidar queryClient.invalidateQueries(['tasks']) ao receber eventos

#### 8.2 Componentes de Tarefa (usando shadcn/ui)

- [x] Criar src/components/tasks/task-card.tsx:
  - [x] Usar shadcn Card, CardHeader, CardContent, CardFooter
  - [x] Exibir título (truncado se muito longo)
  - [x] Exibir descrição (truncada)
  - [x] Usar shadcn Badge para status com variants (pending: secondary, in_progress: default, completed: success)
  - [x] Usar shadcn Badge para prioridade com variants (low: outline, medium: secondary, high: destructive)
  - [x] Data de vencimento formatada (texto destructive se overdue)
  - [x] Usar shadcn Checkbox para marcar como concluída
  - [x] Usar shadcn DropdownMenu para opções: Editar, Excluir
  - [x] Criar src/stories/TaskCard.stories.tsx (estados: default, overdue, completed, high priority)
- [x] Criar src/components/tasks/task-list.tsx:
  - [x] Receber array de tasks
  - [x] Mapear TaskCard para cada task
  - [x] Usar shadcn Skeleton para loading state
  - [x] Empty state com ícone lucide-react quando não há tarefas
  - [x] Criar src/stories/TaskList.stories.tsx (estados: loading, empty, with tasks)
- [x] Criar src/components/tasks/task-filters.tsx:
  - [x] Usar shadcn Select para filtrar por status (Todos, Pendente, Em Progresso, Concluída)
  - [x] Usar shadcn Select para filtrar por prioridade (Todas, Baixa, Média, Alta)
  - [x] Usar shadcn Input para busca com debounce de 300ms
  - [x] Usar shadcn Select para ordenação (Data de criação, Data de vencimento, Prioridade)
  - [x] Usar shadcn Button com ícone para toggle ordem (ASC/DESC)
  - [x] Usar shadcn Select para filtrar por tag (se implementado)
  - [x] Criar src/stories/TaskFilters.stories.tsx
- [x] Criar src/components/tasks/pagination.tsx:
  - [x] Usar shadcn Pagination, PaginationContent, PaginationItem
  - [x] Exibir página atual e total de páginas
  - [x] Usar PaginationPrevious e PaginationNext
  - [x] Desabilitar Previous na primeira página
  - [x] Desabilitar Next na última página
  - [x] Criar src/stories/Pagination.stories.tsx

#### 8.3 Formulário de Tarefa (usando shadcn/ui)

- [x] Criar src/components/tasks/task-form.tsx:
  - [x] Usar shadcn Form com react-hook-form
  - [x] Usar shadcn Input para title e description (Textarea)
  - [x] Usar shadcn Select para status e priority
  - [x] Usar shadcn DatePicker (Popover + Calendar) para dueDate
  - [x] Instalar shadcn calendar se necessário: `pnpm dlx shadcn@latest add calendar popover`
  - [x] Usar multi-select ou combobox para tags (shadcn Combobox ou custom)
  - [x] Validação com zod via FormField
  - [x] Receber initialData opcional para modo edição
  - [x] Callback onSubmit
  - [x] Usar shadcn Button com loading state
  - [x] Criar src/stories/TaskForm.stories.tsx

#### 8.3.1 Gerenciamento de Tags

- [x] Criar src/hooks/use-tags.ts:
  - [x] Implementar useTags(): query GET /tags
  - [x] Implementar useCreateTag: mutation POST /tags
  - [x] Implementar useDeleteTag: mutation DELETE /tags/:id
- [x] Criar src/components/tasks/tag-badge.tsx:
  - [x] Usar shadcn Badge com cor dinâmica baseada na tag.color
  - [x] Criar src/stories/TagBadge.stories.tsx
- [x] Criar src/components/tasks/tag-manager.tsx:
  - [x] Modal para criar/editar/deletar tags do usuário
  - [x] Color picker para cor da tag
  - [x] Criar src/stories/TagManager.stories.tsx

#### 8.4 Modais (usando shadcn/ui)

- [x] Criar src/components/tasks/create-task-modal.tsx:
  - [x] Usar shadcn Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
  - [x] Incluir TaskForm no DialogContent
  - [x] onSubmit chama useCreateTask
  - [x] Fecha modal e mostra toast de sucesso (Sonner)
- [x] Criar src/components/tasks/edit-task-modal.tsx:
  - [x] Usar shadcn Dialog
  - [x] Receber taskId
  - [x] Buscar dados da tarefa com useTask
  - [x] Usar shadcn Skeleton enquanto carrega
  - [x] Modal com TaskForm preenchido
  - [x] onSubmit chama useUpdateTask
- [x] Criar src/components/tasks/delete-confirm-modal.tsx:
  - [x] Usar shadcn AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter
  - [x] AlertDialogTitle e AlertDialogDescription com mensagem de confirmação
  - [x] AlertDialogCancel e AlertDialogAction para botões
  - [x] onConfirm chama useDeleteTask

#### 8.5 Toast/Notificações (usando shadcn Sonner)

- [x] shadcn Sonner já instalado no Ciclo 7.2
- [x] Toaster já configurado no providers (Ciclo 7.4)
- [x] Usar `toast.success()`, `toast.error()` do sonner para feedback
- [x] Integrar nos modais e operações CRUD

#### 8.6 Página de Tarefas

- [x] Criar src/app/(protected)/tasks/page.tsx
- [x] Header com título "Minhas Tarefas" e shadcn Button "Nova Tarefa" com ícone Plus
- [x] TaskFilters abaixo do header
- [x] TaskList no conteúdo principal
- [x] Pagination no footer
- [x] Usar shadcn Separator para dividir seções
- [x] Gerenciar estado local de filtros (useState)
- [x] Passar filtros para useTasks
- [x] Modais controlados por estado (createOpen, editOpen, deleteOpen, selectedTaskId)

#### 8.7 Drag & Drop para Reordenação

- [x] Instalar dependência: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [x] Criar src/components/tasks/task-board.tsx (visão Kanban opcional):
  - [x] Colunas por status: Pendente, Em Progresso, Concluída
  - [x] Usar DndContext e SortableContext do @dnd-kit
  - [x] Permitir arrastar tarefas entre colunas (atualiza status)
  - [x] Permitir reordenar tarefas dentro da coluna
- [x] Adicionar campo `order` na entity Task para persistir ordenação
- [x] Implementar PATCH /tasks/reorder no backend para atualizar ordem em batch
- [x] Criar src/stories/TaskBoard.stories.tsx

#### 8.8 Export de Dados

- [x] Criar src/components/tasks/export-button.tsx:
  - [x] Usar shadcn DropdownMenu com opções: CSV, PDF
  - [x] Ícone Download do lucide-react
- [x] Implementar exportação CSV:
  - [x] Gerar CSV client-side com dados das tarefas filtradas
  - [x] Download automático do arquivo
- [x] Implementar exportação PDF:
  - [x] Instalar dependência: `pnpm add jspdf jspdf-autotable`
  - [x] Gerar PDF com tabela de tarefas
  - [x] Incluir filtros aplicados no cabeçalho
- [x] Criar src/stories/ExportButton.stories.tsx

#### 8.9 Interações

- [x] Click em "Nova Tarefa" abre CreateTaskModal
- [x] Click em "Editar" no TaskCard abre EditTaskModal
- [x] Click em "Excluir" no TaskCard abre DeleteConfirmModal
- [x] Click no checkbox do TaskCard chama useUpdateTask com status: COMPLETED
- [x] Alterar filtros atualiza lista
- [x] Alterar página atualiza lista
- [x] Drag & Drop atualiza status/ordem da tarefa

### Resultado Esperado

Página de tarefas completa e funcional. Usuários podem realizar todas as operações CRUD com feedback visual.

### Checklist de Validação

- [ ] Lista de tarefas carrega ao acessar /tasks
- [ ] Criar tarefa adiciona à lista e fecha modal
- [ ] Editar tarefa atualiza na lista e fecha modal
- [ ] Excluir tarefa remove da lista após confirmação
- [ ] Marcar como concluída via checkbox funciona
- [ ] Filtro por status funciona
- [ ] Filtro por prioridade funciona
- [ ] Busca por texto funciona (com debounce)
- [ ] Ordenação funciona
- [ ] Paginação funciona
- [ ] Loading states aparecem durante operações
- [ ] Toasts de feedback aparecem
- [ ] Empty state aparece quando não há tarefas

---

## CICLO 9: Frontend - Dashboard de Produtividade

### Situação

Os dados de analytics estão disponíveis na API. O dashboard apresentará esses dados de forma visual e intuitiva.

### Task

Implementar o dashboard com cards de KPIs, gráficos de distribuição e gráfico de tendência.

### Ações

#### 9.1 Hooks de Analytics

- [x] Criar src/hooks/use-analytics.ts
- [x] Implementar useAnalyticsOverview: query GET /analytics/overview
- [x] Implementar useAnalyticsByStatus: query GET /analytics/by-status
- [x] Implementar useAnalyticsByPriority: query GET /analytics/by-priority
- [x] Implementar useCompletionTrend: query GET /analytics/completion-trend
- [x] Implementar useProductivityMetrics: query GET /analytics/productivity

#### 9.2 Componentes de Dashboard (usando shadcn/ui)

- [x] Criar src/components/dashboard/kpi-card.tsx:
  - [x] Usar shadcn Card, CardHeader, CardTitle, CardContent
  - [x] Props: title, value, icon, description opcional, trend opcional (up/down)
  - [x] Ícone lucide-react à esquerda no CardHeader
  - [x] Valor grande e destacado no CardContent
  - [x] Título menor usando CardTitle ou CardDescription
  - [x] Indicador de trend com cor (text-green-500 up, text-red-500 down) e ícones TrendingUp/TrendingDown
  - [x] Criar src/stories/KPICard.stories.tsx (variants: up trend, down trend, neutral)
- [x] Criar src/components/dashboard/chart-card.tsx:
  - [x] Usar shadcn Card, CardHeader, CardTitle, CardContent
  - [x] Props: title, children
  - [x] Card com título no header e área para gráfico no content
  - [x] Criar src/stories/ChartCard.stories.tsx

#### 9.3 Gráficos Interativos (Recharts)

- [x] Criar src/components/dashboard/status-pie-chart.tsx:
  - [x] PieChart com dados de by-status
  - [x] Cores distintas por status
  - [x] Tooltip customizado com valor e percentual
  - [x] Legend clicável (drill-down: filtrar tarefas por status ao clicar)
  - [x] Animação de entrada (animationDuration, animationEasing)
  - [x] Criar src/stories/StatusPieChart.stories.tsx
- [x] Criar src/components/dashboard/priority-bar-chart.tsx:
  - [x] BarChart com dados de by-priority
  - [x] Cores distintas por prioridade
  - [x] Tooltip customizado com valor
  - [x] Labels nos eixos
  - [x] Click em barra para drill-down (filtrar tarefas por prioridade)
  - [x] Criar src/stories/PriorityBarChart.stories.tsx
- [x] Criar src/components/dashboard/completion-trend-chart.tsx:
  - [x] AreaChart com dados de completion-trend
  - [x] Duas áreas: created e completed
  - [x] Eixo X com datas formatadas
  - [x] Tooltip customizado com valores
  - [x] Legend
  - [x] Brush component para zoom/scroll em período
  - [x] Criar src/stories/CompletionTrendChart.stories.tsx

#### 9.4 Insights de Produtividade

- [x] Criar src/components/dashboard/productivity-insights.tsx:
  - [x] Card com métricas de produtividade
  - [x] Exibir tempo médio de conclusão formatado (X horas)
  - [x] Exibir comparação semana a semana com seta e percentual
  - [x] Exibir streak com ícone de fogo
  - [x] Exibir dia mais produtivo

#### 9.5 Página de Dashboard

- [x] Criar src/app/(protected)/dashboard/page.tsx
- [x] Layout em grid responsivo (CSS Grid ou Flexbox)
- [x] Seção de KPIs (4 cards):
  - [x] Total de Tarefas
  - [x] Taxa de Conclusão
  - [x] Tarefas Atrasadas
  - [x] Tarefas Concluídas Esta Semana
- [x] Seção de Gráficos (3 gráficos em grid):
  - [x] Distribuição por Status (PieChart)
  - [x] Distribuição por Prioridade (BarChart)
  - [x] Tendência de Conclusão (LineChart)
- [x] Seção de Insights
- [x] Usar shadcn Skeleton para loading states em cada seção
- [x] Empty state com shadcn Card e ícone lucide-react se não há dados suficientes

### Resultado Esperado

Dashboard de produtividade completo com pelo menos 3 gráficos interativos, cards de KPIs e insights. Design responsivo.

### Checklist de Validação

- [ ] KPIs carregam com valores da API
- [ ] Gráfico de status renderiza corretamente
- [ ] Gráfico de prioridade renderiza corretamente
- [ ] Gráfico de tendência renderiza corretamente
- [ ] Tooltips funcionam nos gráficos
- [ ] Loading states aparecem durante carregamento
- [ ] Layout responsivo funciona em mobile

---

## CICLO 10: Frontend - Navegação e Finalização

### Situação

As páginas principais estão implementadas. Agora é necessário uma navegação clara e refinamentos de UI/UX.

### Task

Implementar sistema de navegação (sidebar), adicionar dark mode como diferencial e garantir consistência visual.

### Ações

#### 10.1 Sidebar (usando shadcn/ui)

- [x] Criar src/components/layout/sidebar.tsx:
  - [x] Logo/nome do app no topo com ícone lucide-react
  - [x] Usar shadcn Button variant="ghost" para links de navegação
  - [x] Link para /tasks com ícone CheckSquare
  - [x] Link para /dashboard com ícone BarChart2
  - [x] Destacar link ativo (usePathname + variant="secondary")
  - [x] Usar shadcn Separator como divider
  - [x] Seção do usuário: nome e email do user logado
  - [x] Usar shadcn Button variant="outline" para logout
- [x] Criar src/components/layout/mobile-nav.tsx:
  - [x] Usar shadcn Sheet, SheetTrigger, SheetContent para drawer mobile
  - [x] Usar shadcn Button com ícone Menu para hamburger
  - [x] Mesmos links da sidebar dentro do SheetContent
- [x] Criar src/components/layout/header.tsx:
  - [x] Exibir apenas em mobile (hidden md:hidden)
  - [x] Logo e MobileNav (hamburger menu)

#### 10.2 Layout Protegido

- [x] Atualizar src/app/(protected)/layout.tsx:
  - [x] Sidebar fixa à esquerda em desktop (w-64)
  - [x] Conteúdo principal à direita (flex-1)
  - [x] Header mobile com menu
  - [x] Responsivo: sidebar escondida em mobile

#### 10.3 Dark Mode (integrado com shadcn/ui)

- [x] shadcn já usa CSS variables, dark mode suportado nativamente
- [x] Instalar next-themes: `pnpm add next-themes`
- [x] Criar src/providers/theme-provider.tsx usando ThemeProvider do next-themes:
  - [x] Configurar attribute="class" e defaultTheme="system"
  - [x] Envolver app com ThemeProvider
- [x] Criar src/components/layout/theme-toggle.tsx:
  - [x] Usar shadcn Button variant="ghost" para toggle
  - [x] Usar shadcn DropdownMenu para opções: Light, Dark, System
  - [x] Ícones: Sun, Moon, Laptop do lucide-react
  - [x] Usar useTheme() do next-themes para setTheme
- [x] Adicionar ThemeToggle na sidebar
- [x] CSS variables do shadcn já definem cores para :root e .dark
- [x] Não precisa adicionar classes dark: manualmente - shadcn components já suportam

#### 10.4 Notificações In-App

- [x] Criar src/components/layout/notifications-dropdown.tsx:
  - [x] Usar shadcn DropdownMenu com ícone Bell do lucide-react
  - [x] Badge com contador de não lidas
  - [x] Lista de notificações recentes (tarefas próximas do vencimento, tarefas atrasadas)
  - [x] Marcar como lida ao clicar
  - [x] Link para a tarefa relacionada
- [x] Criar src/stores/notifications.store.ts (Zustand):
  - [x] Estado: notifications[], unreadCount
  - [x] Actions: addNotification, markAsRead, markAllAsRead
- [x] Integrar com dados de analytics (dueSoon, overdueTasks)
- [ ] Criar src/stories/NotificationsDropdown.stories.tsx

#### 10.5 Animações e Transições

- [x] shadcn components já possuem transições em hover
- [x] shadcn Dialog/AlertDialog já possuem animações de fade/scale
- [ ] Adicionar animações de entrada nas listas:
  - [ ] Usar CSS transitions ou framer-motion para stagger em TaskList
  - [ ] Animação de slide-in para novos itens
- [ ] Adicionar animações nos KPI cards:
  - [ ] Contador animado para valores numéricos
- [ ] Adicionar animações de feedback:
  - [ ] Shake animation em erros de formulário
  - [ ] Pulse animation em botões de ação

#### 10.6 Refinamentos Visuais e Acessibilidade

- [x] shadcn components já possuem focus-visible para acessibilidade (Radix UI)
- [ ] Revisar contraste de cores em ambos os temas usando CSS variables
- [ ] Customizar tailwind.config.ts se necessário ajustar cores do tema
- [x] Garantir ARIA labels em todos os ícones interativos
- [ ] Testar navegação por teclado em todas as páginas
- [ ] Verificar screen reader compatibility

#### 10.7 Responsividade

- [ ] Testar todas as páginas em mobile (375px)
- [ ] Testar todas as páginas em tablet (768px)
- [ ] Testar todas as páginas em desktop (1280px+)
- [ ] Ajustar grids e layouts conforme necessário

### Resultado Esperado

Aplicação com navegação clara e intuitiva, dark mode funcional e totalmente responsiva.

### Checklist de Validação

- [ ] Navegação entre /tasks e /dashboard funciona
- [ ] Link ativo é destacado na sidebar
- [ ] Dark mode alterna corretamente
- [ ] Preferência de tema persiste após refresh
- [ ] Sidebar colapsa em mobile (hamburger menu)
- [ ] Layout funciona em todos os breakpoints
- [ ] Logout funciona e redireciona para /login

---

## CICLO 11: Testes

### Situação

A aplicação está funcional, mas precisa de testes. O desafio requer mínimo de 5 testes no backend e 3 no frontend.

### Task

Implementar testes unitários no backend e testes de componentes no frontend.

### Ações

#### 11.1 Configuração Vitest Backend

- [x] Instalar: `pnpm add -D vitest @vitest/coverage-v8 unplugin-swc`
- [x] Criar vitest.config.ts no apps/api
- [x] Configurar para usar SWC (compatibilidade com decorators NestJS)
- [x] Ajustar scripts no package.json: test, test:cov

#### 11.2 Testes Backend

- [x] Teste 1: AuthService.register cria usuário com senha hasheada
- [x] Teste 2: AuthService.login retorna token para credenciais válidas
- [x] Teste 3: TasksService.create cria tarefa vinculada ao usuário
- [x] Teste 4: TasksService.findAll retorna tarefas paginadas
- [x] Teste 5: TasksService.update preenche completedAt quando status = COMPLETED
- [x] Teste 6: AnalyticsService.getOverview calcula métricas corretamente (extra)

#### 11.3 Configuração Vitest Frontend

- [x] Instalar: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
- [x] Criar vitest.config.ts no apps/web
- [x] Criar src/test/setup.ts com configuração do testing-library
- [x] Ajustar scripts no package.json: test, test:cov

#### 11.4 Testes Frontend (componentes shadcn/ui)

- [x] Teste 1: TaskCard renderiza título e shadcn Badges corretamente
- [x] Teste 2: TaskFilters chama callback ao alterar shadcn Select
- [x] Teste 3: LoginForm exibe erro de validação para campos vazios (shadcn Form)
- [x] Teste 4: KPICard renderiza valor e título no shadcn Card (extra)

#### 11.5 GitHub Actions CI

- [x] Criar .github/workflows/ci.yml
- [x] Trigger: push para main, pull_request
- [x] Job lint: rodar ESLint em todos os packages
- [x] Job typecheck: rodar tsc em todos os packages
- [x] Job test: rodar vitest em api e web
- [x] Configurar cache de pnpm
- [x] Configurar services para PostgreSQL, Redis e RabbitMQ nos testes

### Resultado Esperado

Projeto com cobertura de testes adequada (mínimo 5 backend, 3 frontend). GitHub Actions executando lint e testes em cada push/PR.

### Checklist de Validação

- [x] `pnpm --filter api test` executa 5+ testes sem falhas
- [x] `pnpm --filter web test` executa 3+ testes sem falhas
- [x] CI executa em push para main
- [x] CI executa em pull requests
- [x] Falha em lint ou teste quebra o CI

---

## CICLO 11.5: Deploy

### Situação

O projeto está testado e pronto para deploy. Será disponibilizado em ambiente de produção.

### Task

Configurar deploy do frontend no Vercel e backend no Railway ou Render.

### Ações

#### 11.5.1 Preparação para Deploy

- [ ] Revisar variáveis de ambiente de produção
- [ ] Configurar CORS no backend para domínio do frontend
- [ ] Verificar que docker-compose.prod.yml está correto
- [ ] Criar Dockerfile para api se necessário
- [ ] Criar Dockerfile para worker se necessário

#### 11.5.2 Deploy Backend (Railway ou Render)

- [ ] Criar conta no Railway ou Render
- [ ] Criar serviço PostgreSQL
- [ ] Criar serviço Redis
- [ ] Criar serviço RabbitMQ (ou usar CloudAMQP)
- [ ] Deploy da API:
  - [ ] Conectar repositório GitHub
  - [ ] Configurar variáveis de ambiente
  - [ ] Configurar comando de build e start
  - [ ] Executar migrations em produção
- [ ] Deploy do Worker:
  - [ ] Configurar como serviço separado
  - [ ] Configurar variáveis de ambiente

#### 11.5.3 Deploy Frontend (Vercel)

- [ ] Criar conta no Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar root directory: apps/web
- [ ] Configurar variáveis de ambiente:
  - [ ] NEXT_PUBLIC_API_URL apontando para backend em produção
- [ ] Verificar build e deploy automático

#### 11.5.4 Validação de Produção

- [ ] Testar registro e login em produção
- [ ] Testar CRUD de tarefas em produção
- [ ] Testar dashboard em produção
- [ ] Verificar logs de erro
- [ ] Verificar performance

### Resultado Esperado

Aplicação disponível publicamente com frontend no Vercel e backend no Railway/Render.

### Checklist de Validação

- [ ] Frontend acessível via URL do Vercel
- [ ] API acessível via URL do Railway/Render
- [ ] Swagger acessível em produção
- [ ] Todas as funcionalidades operacionais
- [ ] Websockets funcionando em produção

---

## CICLO 12: Documentação e Finalização

### Situação

O projeto está completo e testado. Agora é necessário documentar para facilitar a avaliação.

### Task

Criar README.md completo, finalizar documentação Swagger, revisar código e preparar para entrega.

### Ações

#### 12.1 README.md Principal

- [ ] Escrever descrição do projeto
- [ ] Listar tech stack utilizada
- [ ] Descrever arquitetura e organização de pastas
- [ ] Listar pré-requisitos: Node.js 24, pnpm, Docker
- [ ] Documentar passo a passo para rodar o projeto:
  - [ ] git clone
  - [ ] pnpm install
  - [ ] Copiar .env.example para .env
  - [ ] docker compose up -d
  - [ ] pnpm --filter api typeorm migration:run
  - [ ] pnpm dev (inicia todos os apps)
- [ ] Documentar como rodar testes: pnpm test
- [ ] Incluir link para Swagger: http://localhost:3001/api
- [ ] Documentar decisões técnicas e trade-offs
- [ ] Listar diferenciais implementados
- [ ] Documentar como IA foi usada no desenvolvimento
- [ ] Adicionar screenshots das telas principais

#### 12.2 Swagger

- [x] Revisar todos os endpoints no Swagger
- [x] Verificar descriptions em cada operação
- [x] Verificar examples de request e response
- [x] Verificar documentação de códigos de erro (400, 401, 404, 409)
- [x] Testar cada endpoint via Swagger UI

#### 12.3 Arquivo .env.example

- [x] Incluir todas as variáveis com valores de exemplo:
  - [x] DATABASE_URL
  - [x] REDIS_URL
  - [x] RABBITMQ_URL
  - [x] JWT_SECRET
  - [x] JWT_EXPIRES_IN
  - [x] API_PORT
  - [x] NEXT_PUBLIC_API_URL

#### 12.4 Revisão de Código

- [x] Remover console.log desnecessários
- [x] Remover código comentado
- [x] Remover imports não utilizados
- [x] Executar `pnpm lint` e corrigir warnings
- [x] Executar `pnpm typecheck` e corrigir erros

#### 12.5 Git

- [ ] Revisar histórico de commits (mensagens descritivas)
- [ ] Criar tag v1.0.0
- [ ] Push para repositório público no GitHub
- [ ] Verificar que README renderiza corretamente no GitHub

### Resultado Esperado

Projeto pronto para entrega. README.md permite que avaliadores executem o projeto facilmente. Documentação Swagger completa. Código limpo.

### Checklist de Validação

- [ ] README.md está completo e bem formatado
- [ ] Seguir instruções do README permite rodar o projeto
- [ ] Swagger documenta todos os endpoints corretamente
- [ ] .env.example contém todas as variáveis
- [ ] `pnpm lint` executa sem warnings
- [ ] `pnpm typecheck` executa sem erros
- [ ] Todos os testes passam
- [ ] Repositório está público no GitHub

---

## 📊 Resumo de Diferenciais Implementados

| Diferencial                            | Ciclo  | Status |
| -------------------------------------- | ------ | ------ |
| **Arquitetura & Organização**          |        |        |
| Monorepo bem estruturado (Turborepo)   | 1      | ⬜     |
| Worker separado (RabbitMQ)             | 5      | ⬜     |
| Código compartilhado (packages/shared) | 1      | ⬜     |
| Migrations commitadas                  | 2, 3   | ⬜     |
| **DevOps & Qualidade**                 |        |        |
| Docker Compose production-ready        | 1      | ⬜     |
| GitHub Actions CI                      | 11     | ⬜     |
| Deploy funcionando (Vercel + Railway)  | 11.5   | ⬜     |
| Cobertura de testes alta               | 11     | ⬜     |
| **Features**                           |        |        |
| Busca de tarefas                       | 3      | ⬜     |
| Filtros avançados e combinados         | 3, 8   | ⬜     |
| Drag & Drop (reordenação)              | 8      | ⬜     |
| Dark mode (next-themes + shadcn)       | 10     | ⬜     |
| Websockets (tempo real)                | 6.5, 8 | ⬜     |
| Refresh token                          | 2, 7   | ⬜     |
| Export de dados (CSV, PDF)             | 8      | ⬜     |
| Notificações in-app                    | 10     | ⬜     |
| Categorias/Tags para tarefas           | 3, 8   | ⬜     |
| **UI/UX**                              |        |        |
| Storybook com componentes              | 7-10   | ⬜     |
| Animações e transições elegantes       | 10     | ⬜     |
| Gráficos interativos (tooltips, zoom)  | 9      | ⬜     |
| Design system (shadcn/ui)              | 7      | ⬜     |
| Acessibilidade (Radix UI + ARIA)       | 7-10   | ⬜     |

---

## 🚀 Ordem de Execução

```
Ciclo 1 (Fundação)
    │
    ├── Ciclo 2 (Backend Auth + Refresh Token)
    │       │
    │       └── Ciclo 3 (Backend Tasks + Tags)
    │               │
    │               ├── Ciclo 4 (Backend Cache)
    │               │
    │               ├── Ciclo 5 (Backend RabbitMQ)
    │               │
    │               ├── Ciclo 6 (Backend Analytics)
    │               │
    │               └── Ciclo 6.5 (Backend Websockets)
    │
    └── Ciclo 7 (Frontend Auth + Storybook) ──────┐
            │                                      │
            └── Ciclo 8 (Frontend Tasks + Drag&Drop + Export + Tags)
                    │
                    └── Ciclo 9 (Frontend Dashboard + Gráficos Interativos)
                            │
                            └── Ciclo 10 (Nav + Notificações + Animações)
                                    │
                                    └── Ciclo 11 (Testes)
                                            │
                                            └── Ciclo 11.5 (Deploy)
                                                    │
                                                    └── Ciclo 12 (Documentação)
```

---

**Desafio Técnico - Loopt | Desenvolvedor Full Stack Pleno**

```

```
