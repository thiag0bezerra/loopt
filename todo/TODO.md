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
- **Estilização:** TailwindCSS
- **Estado Global:** Zustand
- **Data Fetching:** TanStack Query
- **HTTP Client:** Axios
- **Gráficos:** Recharts
- **Testes:** Vitest + Testing Library

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
- [ ] Remover apps de exemplo gerados pelo template
- [ ] Ajustar `turbo.json` com pipelines: build, dev, test, lint, typecheck
- [ ] Ajustar `pnpm-workspace.yaml` para incluir apps/_ e packages/_

#### 1.2 Configurações Compartilhadas

- [ ] Criar `tsconfig.base.json` na raiz com configurações TypeScript 5 compartilhadas
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

- [ ] Criar diretório src/tasks
- [ ] Criar entity Task em src/tasks/entities/task.entity.ts
- [ ] Definir campos conforme modelo de dados
- [ ] Criar relacionamento ManyToOne com User (userId como FK)
- [ ] Adicionar índices em userId, status, priority para otimização de queries
- [ ] Criar migration: `pnpm typeorm migration:generate src/database/migrations/CreateTasks`
- [ ] Executar migration

#### 3.2 DTOs Task

- [ ] Criar CreateTaskDto em src/tasks/dto/create-task.dto.ts:
  - [ ] title: string (IsNotEmpty, MaxLength 255)
  - [ ] description: string opcional (MaxLength 1000)
  - [ ] status: TaskStatus opcional (IsEnum, default PENDING)
  - [ ] priority: TaskPriority opcional (IsEnum, default MEDIUM)
  - [ ] dueDate: Date opcional (IsDateString)
- [ ] Criar UpdateTaskDto em src/tasks/dto/update-task.dto.ts usando PartialType(CreateTaskDto)
- [ ] Criar TaskFilterDto em src/tasks/dto/task-filter.dto.ts:
  - [ ] status: TaskStatus opcional
  - [ ] priority: TaskPriority opcional
  - [ ] search: string opcional (busca em título e descrição)
  - [ ] page: number (default 1, Min 1)
  - [ ] limit: number (default 10, Min 1, Max 50)
  - [ ] sortBy: string (default 'createdAt')
  - [ ] sortOrder: 'ASC' | 'DESC' (default 'DESC')

#### 3.3 TasksService

- [ ] Criar TasksModule em src/tasks/tasks.module.ts
- [ ] Criar TasksService em src/tasks/tasks.service.ts
- [ ] Implementar create(userId: string, dto: CreateTaskDto): criar tarefa vinculada ao usuário
- [ ] Implementar findAll(userId: string, filters: TaskFilterDto): retornar PaginatedResponse
  - [ ] Aplicar filtro por status se fornecido
  - [ ] Aplicar filtro por priority se fornecido
  - [ ] Aplicar busca ILIKE em title e description se search fornecido
  - [ ] Aplicar ordenação por sortBy e sortOrder
  - [ ] Aplicar paginação com skip e take
  - [ ] Retornar { data, meta: { total, page, limit, totalPages } }
- [ ] Implementar findOne(userId: string, taskId: string): buscar tarefa ou lançar NotFoundException
- [ ] Implementar update(userId: string, taskId: string, dto: UpdateTaskDto):
  - [ ] Buscar tarefa (validar ownership)
  - [ ] Se status mudando para COMPLETED, preencher completedAt
  - [ ] Se status mudando de COMPLETED para outro, limpar completedAt
  - [ ] Salvar e retornar tarefa atualizada
- [ ] Implementar remove(userId: string, taskId: string): deletar tarefa ou lançar NotFoundException

#### 3.4 TasksController

- [ ] Criar TasksController em src/tasks/tasks.controller.ts
- [ ] Aplicar @UseGuards(JwtAuthGuard) no controller
- [ ] Implementar POST /tasks: criar tarefa, retornar 201
- [ ] Implementar GET /tasks: listar tarefas com query params do TaskFilterDto
- [ ] Implementar GET /tasks/:id: buscar tarefa específica
- [ ] Implementar PATCH /tasks/:id: atualizar tarefa
- [ ] Implementar DELETE /tasks/:id: deletar tarefa, retornar 204
- [ ] Adicionar decorators Swagger em todos os endpoints

#### 3.5 Testes Tasks

- [ ] Criar src/tasks/tasks.service.spec.ts
- [ ] Teste: create cria tarefa vinculada ao usuário
- [ ] Teste: findAll retorna apenas tarefas do usuário
- [ ] Teste: findAll aplica filtros corretamente
- [ ] Teste: update atualiza campos e preenche completedAt quando status = COMPLETED
- [ ] Teste: remove deleta tarefa existente

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

- [ ] Instalar dependências: `pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-yet`
- [ ] Criar CacheModule em src/cache/cache.module.ts
- [ ] Configurar CacheModule.registerAsync() com Redis store
- [ ] Exportar CacheModule como global

#### 4.2 CacheService

- [ ] Criar CacheService em src/cache/cache.service.ts
- [ ] Injetar CACHE_MANAGER
- [ ] Implementar get<T>(key: string): Promise<T | undefined>
- [ ] Implementar set(key: string, value: unknown, ttl?: number): Promise<void>
- [ ] Implementar del(key: string): Promise<void>
- [ ] Implementar delByPattern(pattern: string): Promise<void> usando scan do Redis
- [ ] Adicionar logs para debug de cache hits/misses

#### 4.3 Cache na Listagem de Tarefas

- [ ] Criar função para gerar chave de cache: `tasks:${userId}:${JSON.stringify(filters)}`
- [ ] No TasksService.findAll:
  - [ ] Verificar cache antes de consultar banco
  - [ ] Se cache hit, retornar dados do cache
  - [ ] Se cache miss, consultar banco e salvar no cache com TTL 300 (5 minutos)

#### 4.4 Invalidação de Cache

- [ ] Criar método privado invalidateUserCache(userId: string) no TasksService
- [ ] Usar delByPattern para invalidar todas as chaves `tasks:${userId}:*`
- [ ] Chamar invalidateUserCache em:
  - [ ] TasksService.create após criar tarefa
  - [ ] TasksService.update após atualizar tarefa
  - [ ] TasksService.remove após deletar tarefa

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

- [ ] Instalar dependências: `pnpm add @nestjs/microservices amqplib amqp-connection-manager`
- [ ] Instalar tipos: `pnpm add -D @types/amqplib`
- [ ] Criar NotificationsModule em src/notifications/notifications.module.ts
- [ ] Configurar ClientsModule.registerAsync() com RabbitMQ transport
- [ ] Definir nome da queue: high-priority-tasks

#### 5.2 NotificationsService

- [ ] Criar NotificationsService em src/notifications/notifications.service.ts
- [ ] Injetar ClientProxy do RabbitMQ
- [ ] Criar interface TaskNotificationPayload com: taskId, taskTitle, userId, userEmail, userName, createdAt
- [ ] Implementar sendHighPriorityNotification(task: Task, user: User): void
  - [ ] Montar payload
  - [ ] Emitir mensagem com pattern 'task.created.high'

#### 5.3 Integração no TasksService

- [ ] Injetar NotificationsService no TasksService
- [ ] No método create, após salvar tarefa:
  - [ ] Se priority === HIGH, chamar sendHighPriorityNotification

#### 5.4 Worker Separado

- [ ] Criar app worker: `pnpm dlx @nestjs/cli@latest new worker --directory apps/worker --package-manager pnpm --skip-git`
- [ ] Remover arquivos desnecessários
- [ ] Adicionar dependência do @loopt/shared
- [ ] Instalar: `pnpm add @nestjs/microservices amqplib amqp-connection-manager @nestjs/config`
- [ ] Configurar main.ts como microservice (não HTTP)
- [ ] Conectar ao RabbitMQ via Transport.RMQ
- [ ] Criar NotificationConsumerService em src/notification-consumer.service.ts
- [ ] Implementar handler com @MessagePattern('task.created.high')
- [ ] Processar mensagem: logar no console simulando envio de notificação
- [ ] Implementar tratamento de erros com try/catch
- [ ] Adicionar script de start no package.json

#### 5.5 Docker Compose

- [ ] Adicionar serviço worker no docker-compose.yml
- [ ] Configurar dependência do RabbitMQ
- [ ] Configurar variáveis de ambiente

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

- [ ] Criar diretório src/analytics
- [ ] Criar AnalyticsModule em src/analytics/analytics.module.ts
- [ ] Importar TypeOrmModule.forFeature([Task])
- [ ] Importar CacheModule

#### 6.2 AnalyticsService

- [ ] Criar AnalyticsService em src/analytics/analytics.service.ts
- [ ] Injetar Repository<Task> e CacheService

#### 6.3 Endpoint Overview

- [ ] Implementar getOverview(userId: string) retornando:
  - [ ] totalTasks: número total de tarefas
  - [ ] completedTasks: tarefas com status COMPLETED
  - [ ] pendingTasks: tarefas com status PENDING
  - [ ] inProgressTasks: tarefas com status IN_PROGRESS
  - [ ] completionRate: (completedTasks / totalTasks) \* 100
  - [ ] overdueTasks: tarefas com dueDate < hoje e status != COMPLETED
  - [ ] dueSoon: tarefas com dueDate nos próximos 3 dias e status != COMPLETED
- [ ] Aplicar cache com chave `analytics:${userId}:overview` e TTL 300

#### 6.4 Endpoint By Status

- [ ] Implementar getByStatus(userId: string) retornando array:
  - [ ] { status: 'pending', count: number }
  - [ ] { status: 'in_progress', count: number }
  - [ ] { status: 'completed', count: number }
- [ ] Usar GROUP BY status na query
- [ ] Aplicar cache com chave `analytics:${userId}:by-status` e TTL 300

#### 6.5 Endpoint By Priority

- [ ] Implementar getByPriority(userId: string) retornando array:
  - [ ] { priority: 'low', count: number }
  - [ ] { priority: 'medium', count: number }
  - [ ] { priority: 'high', count: number }
- [ ] Usar GROUP BY priority na query
- [ ] Aplicar cache com chave `analytics:${userId}:by-priority` e TTL 300

#### 6.6 Endpoint Completion Trend

- [ ] Implementar getCompletionTrend(userId: string, days: number = 7) retornando array:
  - [ ] { date: 'YYYY-MM-DD', completed: number, created: number }
- [ ] Gerar array com últimos N dias
- [ ] Contar tarefas criadas por dia (usando createdAt)
- [ ] Contar tarefas completadas por dia (usando completedAt)
- [ ] Aplicar cache com chave `analytics:${userId}:trend:${days}` e TTL 300

#### 6.7 Endpoint Productivity

- [ ] Implementar getProductivity(userId: string) retornando:
  - [ ] averageCompletionTime: média em horas de (completedAt - createdAt) para tarefas completadas
  - [ ] tasksCompletedThisWeek: tarefas completadas na semana atual
  - [ ] tasksCompletedLastWeek: tarefas completadas na semana anterior
  - [ ] weekOverWeekChange: ((thisWeek - lastWeek) / lastWeek) \* 100
  - [ ] streakDays: dias consecutivos (até hoje) com pelo menos 1 tarefa completada
  - [ ] mostProductiveDay: dia da semana com mais tarefas completadas
- [ ] Aplicar cache com chave `analytics:${userId}:productivity` e TTL 300

#### 6.8 AnalyticsController

- [ ] Criar AnalyticsController em src/analytics/analytics.controller.ts
- [ ] Aplicar @UseGuards(JwtAuthGuard)
- [ ] Implementar GET /analytics/overview
- [ ] Implementar GET /analytics/by-status
- [ ] Implementar GET /analytics/by-priority
- [ ] Implementar GET /analytics/completion-trend com query param days opcional
- [ ] Implementar GET /analytics/productivity
- [ ] Adicionar decorators Swagger

#### 6.9 Invalidação de Cache Analytics

- [ ] No TasksService, adicionar invalidação das chaves de analytics:
  - [ ] Invalidar `analytics:${userId}:*` em create, update e remove

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

## CICLO 7: Frontend - Estrutura Base e Autenticação

### Situação

O backend está completo. O frontend será iniciado com Next.js, configurando a estrutura base e sistema de autenticação.

### Task

Criar a aplicação Next.js com App Router, configurar dependências, implementar páginas de login/registro e sistema de rotas protegidas.

### Ações

#### 7.1 Inicialização Next.js

- [ ] Criar app Next.js: `pnpm dlx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] Adicionar dependência do @loopt/shared no package.json
- [ ] Instalar dependências de estado: `pnpm add zustand`
- [ ] Instalar dependências de data fetching: `pnpm add @tanstack/react-query`
- [ ] Instalar dependências HTTP: `pnpm add axios`
- [ ] Instalar dependências de formulário: `pnpm add react-hook-form @hookform/resolvers zod`
- [ ] Instalar dependências de gráficos: `pnpm add recharts`
- [ ] Instalar dependências de ícones: `pnpm add lucide-react`
- [ ] Configurar path aliases no tsconfig.json

#### 7.2 Configuração de API Client

- [ ] Criar src/lib/api.ts
- [ ] Criar instância Axios com baseURL do NEXT_PUBLIC_API_URL
- [ ] Criar interceptor de request para adicionar token do localStorage
- [ ] Criar interceptor de response para tratar 401 (limpar auth e redirecionar para /login)

#### 7.3 Providers

- [ ] Criar src/providers/query-provider.tsx com QueryClientProvider
- [ ] Configurar defaultOptions: queries (staleTime: 5 minutos, retry: 1)
- [ ] Criar src/app/providers.tsx combinando providers
- [ ] Envolver children em layout.tsx com providers

#### 7.4 Store de Autenticação (Zustand)

- [ ] Criar src/stores/auth.store.ts
- [ ] Definir interface AuthState: user, token, isAuthenticated, setAuth, logout, hydrate
- [ ] Implementar setAuth: salvar user e token no state e localStorage
- [ ] Implementar logout: limpar state e localStorage, redirecionar para /login
- [ ] Implementar hydrate: carregar token do localStorage e buscar usuário da API
- [ ] Usar persist middleware do Zustand para token

#### 7.5 Hooks de Autenticação

- [ ] Criar src/hooks/use-auth.ts
- [ ] Implementar useLogin: mutation que chama POST /auth/login, onSuccess chama setAuth
- [ ] Implementar useRegister: mutation que chama POST /auth/register, onSuccess chama setAuth
- [ ] Implementar useCurrentUser: query que chama GET /auth/me, enabled quando tem token

#### 7.6 Componentes de UI Base

- [ ] Criar src/components/ui/button.tsx
- [ ] Criar src/components/ui/input.tsx
- [ ] Criar src/components/ui/label.tsx
- [ ] Criar src/components/ui/card.tsx
- [ ] Criar src/components/ui/alert.tsx para mensagens de erro

#### 7.7 Página de Login

- [ ] Criar src/app/(auth)/login/page.tsx
- [ ] Criar formulário com react-hook-form e validação zod
- [ ] Campos: email (required, email), password (required, min 6)
- [ ] Botão de submit com loading state (disabled + spinner)
- [ ] Exibir mensagens de erro da API
- [ ] Link para página de registro
- [ ] onSuccess: redirecionar para /tasks

#### 7.8 Página de Registro

- [ ] Criar src/app/(auth)/register/page.tsx
- [ ] Criar formulário com react-hook-form e validação zod
- [ ] Campos: name (required), email (required, email), password (required, min 6), confirmPassword (deve ser igual a password)
- [ ] Botão de submit com loading state
- [ ] Exibir mensagens de erro da API
- [ ] Link para página de login
- [ ] onSuccess: redirecionar para /tasks

#### 7.9 Layout de Auth

- [ ] Criar src/app/(auth)/layout.tsx
- [ ] Layout centralizado e minimalista
- [ ] Logo/título do app
- [ ] Redirecionar para /tasks se já autenticado

#### 7.10 Proteção de Rotas

- [ ] Criar src/components/auth/protected-route.tsx
- [ ] Verificar isAuthenticated do store
- [ ] Se não autenticado, redirecionar para /login
- [ ] Mostrar loading enquanto hidrata estado
- [ ] Criar src/app/(protected)/layout.tsx usando ProtectedRoute

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

- [ ] Criar src/hooks/use-tasks.ts
- [ ] Implementar useTasks(filters): query GET /tasks com query params
- [ ] Implementar useTask(id): query GET /tasks/:id
- [ ] Implementar useCreateTask: mutation POST /tasks, invalidate useTasks
- [ ] Implementar useUpdateTask: mutation PATCH /tasks/:id, invalidate useTasks e useTask
- [ ] Implementar useDeleteTask: mutation DELETE /tasks/:id, invalidate useTasks

#### 8.2 Componentes de Tarefa

- [ ] Criar src/components/tasks/task-card.tsx:
  - [ ] Exibir título (truncado se muito longo)
  - [ ] Exibir descrição (truncada)
  - [ ] Badge de status com cores (pending: amarelo, in_progress: azul, completed: verde)
  - [ ] Badge de prioridade com cores (low: cinza, medium: amarelo, high: vermelho)
  - [ ] Data de vencimento formatada (vermelho se overdue)
  - [ ] Checkbox para marcar como concluída
  - [ ] Botão de menu com opções: Editar, Excluir
- [ ] Criar src/components/tasks/task-list.tsx:
  - [ ] Receber array de tasks
  - [ ] Mapear TaskCard para cada task
  - [ ] Loading skeleton enquanto carrega
  - [ ] Empty state quando não há tarefas
- [ ] Criar src/components/tasks/task-filters.tsx:
  - [ ] Select para filtrar por status (Todos, Pendente, Em Progresso, Concluída)
  - [ ] Select para filtrar por prioridade (Todas, Baixa, Média, Alta)
  - [ ] Input de busca com debounce de 300ms
  - [ ] Select para ordenação (Data de criação, Data de vencimento, Prioridade)
  - [ ] Botão para toggle ordem (ASC/DESC)
- [ ] Criar src/components/tasks/pagination.tsx:
  - [ ] Exibir página atual e total de páginas
  - [ ] Botões Previous/Next
  - [ ] Desabilitar Previous na primeira página
  - [ ] Desabilitar Next na última página

#### 8.3 Formulário de Tarefa

- [ ] Criar src/components/tasks/task-form.tsx:
  - [ ] Campos: title, description, status, priority, dueDate
  - [ ] Validação com zod
  - [ ] Receber initialData opcional para modo edição
  - [ ] Callback onSubmit
  - [ ] Loading state no botão

#### 8.4 Modais

- [ ] Criar src/components/tasks/create-task-modal.tsx:
  - [ ] Modal com TaskForm
  - [ ] onSubmit chama useCreateTask
  - [ ] Fecha modal e mostra toast de sucesso
- [ ] Criar src/components/tasks/edit-task-modal.tsx:
  - [ ] Receber taskId
  - [ ] Buscar dados da tarefa com useTask
  - [ ] Modal com TaskForm preenchido
  - [ ] onSubmit chama useUpdateTask
- [ ] Criar src/components/tasks/delete-confirm-modal.tsx:
  - [ ] Receber taskId e taskTitle
  - [ ] Mensagem de confirmação
  - [ ] Botões Cancelar e Confirmar
  - [ ] onConfirm chama useDeleteTask

#### 8.5 Toast/Notificações

- [ ] Criar src/components/ui/toast.tsx ou usar solução simples
- [ ] Criar hook useToast para exibir mensagens de sucesso/erro
- [ ] Integrar nos modais e operações

#### 8.6 Página de Tarefas

- [ ] Criar src/app/(protected)/tasks/page.tsx
- [ ] Header com título "Minhas Tarefas" e botão "Nova Tarefa"
- [ ] TaskFilters abaixo do header
- [ ] TaskList no conteúdo principal
- [ ] Pagination no footer
- [ ] Gerenciar estado local de filtros (useState)
- [ ] Passar filtros para useTasks
- [ ] Modais controlados por estado (createOpen, editOpen, deleteOpen, selectedTaskId)

#### 8.7 Interações

- [ ] Click em "Nova Tarefa" abre CreateTaskModal
- [ ] Click em "Editar" no TaskCard abre EditTaskModal
- [ ] Click em "Excluir" no TaskCard abre DeleteConfirmModal
- [ ] Click no checkbox do TaskCard chama useUpdateTask com status: COMPLETED
- [ ] Alterar filtros atualiza lista
- [ ] Alterar página atualiza lista

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

- [ ] Criar src/hooks/use-analytics.ts
- [ ] Implementar useAnalyticsOverview: query GET /analytics/overview
- [ ] Implementar useAnalyticsByStatus: query GET /analytics/by-status
- [ ] Implementar useAnalyticsByPriority: query GET /analytics/by-priority
- [ ] Implementar useCompletionTrend: query GET /analytics/completion-trend
- [ ] Implementar useProductivityMetrics: query GET /analytics/productivity

#### 9.2 Componentes de Dashboard

- [ ] Criar src/components/dashboard/kpi-card.tsx:
  - [ ] Props: title, value, icon, description opcional, trend opcional (up/down)
  - [ ] Ícone à esquerda
  - [ ] Valor grande e destacado
  - [ ] Título menor abaixo
  - [ ] Indicador de trend com cor (verde up, vermelho down)
- [ ] Criar src/components/dashboard/chart-card.tsx:
  - [ ] Props: title, children
  - [ ] Card com título e área para gráfico

#### 9.3 Gráficos (Recharts)

- [ ] Criar src/components/dashboard/status-pie-chart.tsx:
  - [ ] PieChart com dados de by-status
  - [ ] Cores distintas por status
  - [ ] Tooltip com valor e percentual
  - [ ] Legend clicável
- [ ] Criar src/components/dashboard/priority-bar-chart.tsx:
  - [ ] BarChart com dados de by-priority
  - [ ] Cores distintas por prioridade
  - [ ] Tooltip com valor
  - [ ] Labels nos eixos
- [ ] Criar src/components/dashboard/completion-trend-chart.tsx:
  - [ ] LineChart ou AreaChart com dados de completion-trend
  - [ ] Duas linhas: created e completed
  - [ ] Eixo X com datas formatadas
  - [ ] Tooltip com valores
  - [ ] Legend

#### 9.4 Insights de Produtividade

- [ ] Criar src/components/dashboard/productivity-insights.tsx:
  - [ ] Card com métricas de produtividade
  - [ ] Exibir tempo médio de conclusão formatado (X horas)
  - [ ] Exibir comparação semana a semana com seta e percentual
  - [ ] Exibir streak com ícone de fogo
  - [ ] Exibir dia mais produtivo

#### 9.5 Página de Dashboard

- [ ] Criar src/app/(protected)/dashboard/page.tsx
- [ ] Layout em grid responsivo (CSS Grid ou Flexbox)
- [ ] Seção de KPIs (4 cards):
  - [ ] Total de Tarefas
  - [ ] Taxa de Conclusão
  - [ ] Tarefas Atrasadas
  - [ ] Tarefas Concluídas Esta Semana
- [ ] Seção de Gráficos (3 gráficos em grid):
  - [ ] Distribuição por Status (PieChart)
  - [ ] Distribuição por Prioridade (BarChart)
  - [ ] Tendência de Conclusão (LineChart)
- [ ] Seção de Insights
- [ ] Loading skeletons para cada seção
- [ ] Empty state se não há dados suficientes

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

#### 10.1 Sidebar

- [ ] Criar src/components/layout/sidebar.tsx:
  - [ ] Logo/nome do app no topo
  - [ ] Link para /tasks com ícone (ex: CheckSquare)
  - [ ] Link para /dashboard com ícone (ex: BarChart2)
  - [ ] Destacar link ativo (usar usePathname)
  - [ ] Divider
  - [ ] Seção do usuário: nome e email do user logado
  - [ ] Botão de logout
- [ ] Criar src/components/layout/mobile-nav.tsx:
  - [ ] Hamburger menu para mobile
  - [ ] Drawer/Sheet com mesmos links da sidebar
- [ ] Criar src/components/layout/header.tsx:
  - [ ] Exibir apenas em mobile
  - [ ] Logo e hamburger menu

#### 10.2 Layout Protegido

- [ ] Atualizar src/app/(protected)/layout.tsx:
  - [ ] Sidebar fixa à esquerda em desktop (w-64)
  - [ ] Conteúdo principal à direita (flex-1)
  - [ ] Header mobile com menu
  - [ ] Responsivo: sidebar escondida em mobile

#### 10.3 Dark Mode

- [ ] Configurar TailwindCSS para dark mode (class-based) em tailwind.config.ts
- [ ] Criar src/stores/theme.store.ts:
  - [ ] theme: 'light' | 'dark' | 'system'
  - [ ] setTheme(theme)
  - [ ] Persistir no localStorage
- [ ] Criar src/components/layout/theme-toggle.tsx:
  - [ ] Botão para alternar entre light/dark
  - [ ] Ícone de sol/lua
- [ ] Adicionar ThemeToggle na sidebar
- [ ] Criar src/providers/theme-provider.tsx:
  - [ ] Aplicar classe 'dark' no document.documentElement
  - [ ] Respeitar preferência do sistema se 'system'
- [ ] Aplicar classes dark: em todos os componentes existentes

#### 10.4 Refinamentos Visuais

- [ ] Adicionar transições em hover de botões e cards
- [ ] Adicionar animação de fade em modais
- [ ] Adicionar focus-visible para acessibilidade
- [ ] Revisar contraste de cores em ambos os temas

#### 10.5 Responsividade

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

- [ ] Instalar: `pnpm add -D vitest @vitest/coverage-v8 unplugin-swc`
- [ ] Criar vitest.config.ts no apps/api
- [ ] Configurar para usar SWC (compatibilidade com decorators NestJS)
- [ ] Ajustar scripts no package.json: test, test:cov

#### 11.2 Testes Backend

- [ ] Teste 1: AuthService.register cria usuário com senha hasheada
- [ ] Teste 2: AuthService.login retorna token para credenciais válidas
- [ ] Teste 3: TasksService.create cria tarefa vinculada ao usuário
- [ ] Teste 4: TasksService.findAll retorna tarefas paginadas
- [ ] Teste 5: TasksService.update preenche completedAt quando status = COMPLETED
- [ ] Teste 6: AnalyticsService.getOverview calcula métricas corretamente (extra)

#### 11.3 Configuração Vitest Frontend

- [ ] Instalar: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
- [ ] Criar vitest.config.ts no apps/web
- [ ] Criar src/test/setup.ts com configuração do testing-library
- [ ] Ajustar scripts no package.json: test, test:cov

#### 11.4 Testes Frontend

- [ ] Teste 1: TaskCard renderiza título e badges corretamente
- [ ] Teste 2: TaskFilters chama callback ao alterar filtro
- [ ] Teste 3: LoginForm exibe erro de validação para campos vazios
- [ ] Teste 4: KPICard renderiza valor e título (extra)

#### 11.5 GitHub Actions CI

- [ ] Criar .github/workflows/ci.yml
- [ ] Trigger: push para main, pull_request
- [ ] Job lint: rodar ESLint em todos os packages
- [ ] Job typecheck: rodar tsc em todos os packages
- [ ] Job test: rodar vitest em api e web
- [ ] Configurar cache de pnpm
- [ ] Configurar services para PostgreSQL, Redis e RabbitMQ nos testes

### Resultado Esperado

Projeto com cobertura de testes adequada (mínimo 5 backend, 3 frontend). GitHub Actions executando lint e testes em cada push/PR.

### Checklist de Validação

- [ ] `pnpm --filter api test` executa 5+ testes sem falhas
- [ ] `pnpm --filter web test` executa 3+ testes sem falhas
- [ ] CI executa em push para main
- [ ] CI executa em pull requests
- [ ] Falha em lint ou teste quebra o CI

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

- [ ] Revisar todos os endpoints no Swagger
- [ ] Verificar descriptions em cada operação
- [ ] Verificar examples de request e response
- [ ] Verificar documentação de códigos de erro (400, 401, 404, 409)
- [ ] Testar cada endpoint via Swagger UI

#### 12.3 Arquivo .env.example

- [ ] Incluir todas as variáveis com valores de exemplo:
  - [ ] DATABASE_URL
  - [ ] REDIS_URL
  - [ ] RABBITMQ_URL
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRES_IN
  - [ ] API_PORT
  - [ ] NEXT_PUBLIC_API_URL

#### 12.4 Revisão de Código

- [ ] Remover console.log desnecessários
- [ ] Remover código comentado
- [ ] Remover imports não utilizados
- [ ] Executar `pnpm lint` e corrigir warnings
- [ ] Executar `pnpm typecheck` e corrigir erros

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

| Diferencial                            | Ciclo | Status |
| -------------------------------------- | ----- | ------ |
| Monorepo bem estruturado (Turborepo)   | 1     | ⬜     |
| Worker separado (RabbitMQ)             | 5     | ⬜     |
| Código compartilhado (packages/shared) | 1     | ⬜     |
| Migrations commitadas                  | 2, 3  | ⬜     |
| Docker Compose production-ready        | 1     | ⬜     |
| GitHub Actions CI                      | 11    | ⬜     |
| Busca de tarefas                       | 3     | ⬜     |
| Dark mode                              | 10    | ⬜     |
| Gráficos interativos                   | 9     | ⬜     |

---

## 🚀 Ordem de Execução

```
Ciclo 1 (Fundação)
    │
    ├── Ciclo 2 (Backend Auth)
    │       │
    │       └── Ciclo 3 (Backend Tasks)
    │               │
    │               ├── Ciclo 4 (Backend Cache)
    │               │
    │               ├── Ciclo 5 (Backend RabbitMQ)
    │               │
    │               └── Ciclo 6 (Backend Analytics)
    │
    └── Ciclo 7 (Frontend Auth) ──────┐
            │                         │
            └── Ciclo 8 (Frontend Tasks)
                    │
                    └── Ciclo 9 (Frontend Dashboard)
                            │
                            └── Ciclo 10 (Frontend Nav/Polish)
                                    │
                                    └── Ciclo 11 (Testes)
                                            │
                                            └── Ciclo 12 (Documentação)
```

---

**Desafio Técnico - Loopt | Desenvolvedor Full Stack Pleno**

```

```
