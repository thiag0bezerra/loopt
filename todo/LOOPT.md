# LOOPT

## Desafio Técnico | Engenheiro Full Stack Pleno

### Visão Geral

Desenvolva uma aplicação monorepo de gestão de tarefas com duas interfaces principais: uma para gerenciar tarefas (CRUD) e outra com dashboard de produtividade com métricas e visualizações. O projeto deve incluir autenticação, cache, processamento assíncrono e boas práticas de desenvolvimento.

**RECOMENDADO:**

- Use um gerenciador de monorepo (NX ou Turborepo) para organizar o projeto.
- Use Docker Compose para facilitar a avaliação e setup da infraestrutura (PostgreSQL, Redis, RabbitMQ). Isso nos ajuda a testar seu projeto rapidamente.

### Sobre o Uso de IA no Desenvolvimento

Incentivamos fortemente o uso de ferramentas de IA (Claude Code, Cursor, Copilot, v0.dev, etc.) para acelerar seu desenvolvimento, assim como fazemos no dia a dia da Loopt.
Lembre-se: IA é uma ferramenta para aumentar produtividade, não para substituir pensamento crítico. Queremos ver que você sabe usar IA de forma inteligente.

### O que deve estar no projeto

Seu projeto deve conter:

- **Backend:** API REST com NestJS
- **Frontend:** Aplicação web com Next.js
- **Infraestrutura:** PostgreSQL, Redis e RabbitMQ (recomendamos Docker Compose)
- (Opcional) Worker separado para processar fila
- (Opcional) Código compartilhado entre backend e frontend (tipos, utilitários, etc)

A organização de pastas, arquitetura, nomenclaturas e estrutura interna ficam totalmente a seu critério. Queremos avaliar suas decisões e capacidade de organização.

---

## Funcionalidades Requeridas

### Backend (NestJS + TypeScript)

Desenvolva uma API REST com os seguintes recursos:

#### 1. Autenticação

Implemente registro e login de usuários com JWT. Proteja rotas que precisam de autenticação.
Funcionalidades esperadas:

- Criar novo usuário (validar email único)
- Login retornando token JWT
- Proteção de rotas privadas

#### 2. Gestão de Tarefas (CRUD Completo)

Crie endpoints para gerenciamento completo de tarefas.
Funcionalidades esperadas:

- Criar tarefa
- Listar tarefas do usuário autenticado (com paginação, filtros por status/prioridade, ordenação)
- Buscar detalhes de uma tarefa específica
- Atualizar qualquer campo de uma tarefa
- Deletar tarefa

**Informações da Tarefa (defina seu próprio modelo):**
Cada tarefa deve ter no mínimo:

- Identificador único
- Título (obrigatório)
- Descrição (opcional)
- Status (sugestão: pendente, em progresso, concluída)
- Prioridade (sugestão: baixa, média, alta)
- Data de vencimento (opcional)
- Timestamps (criação, atualização)
- Relação com usuário proprietário

A estrutura exata do modelo e nomenclaturas ficam a seu critério.

#### 3. Analytics e Métricas de Produtividade

Crie endpoints que retornem dados para alimentar o dashboard de produtividade.
Dados necessários:

- Métricas gerais (totais, taxas, status)
- Dados para visualizações gráficas
- Indicadores de produtividade

A estrutura dos endpoints, métricas específicas e formato dos dados ficam a seu critério. Seja criativo nos insights de produtividade!

#### 4. Sistema de Notificações (RabbitMQ)

Implemente processamento assincrono usando fila de mensagens.
Funcionalidade esperada:

- Quando uma tarefa de alta prioridade for criada, enviar mensagem para fila
- Processar mensagem (pode simular envio de notificação logando no console)

A arquitetura (worker separado vs processamento no backend) fica a seu critério.

#### 5. Cache (Redis)

Implemente cache para otimizar performance.
Funcionalidades esperadas:

- Cache na listagem de tarefas
- Cache nos endpoints de analytics
- Invalidação automática quando dados são modificados
- TTL apropriado (sugestão: 5 minutos)

---

### Frontend (Next.js + React + TypeScript)

Desenvolva uma aplicação web com as seguintes paginas/funcionalidades:

#### Páginas de Autenticação

Login e Registro:

- Formulários funcionais com validação
- Tratamento de erros de autenticação
- Redirecionamento após login bem-sucedido
- Persistência de token JWT

#### Página de Gestão de Tarefas

Esta é a página principal para operações CRUD.
Funcionalidades necessárias:

- Visualizar lista de tarefas do usuário
- Criar nova tarefa
- Editar tarefa existente
- Deletar tarefa (com confirmação)
- Marcar tarefa como concluída rapidamente
- Filtrar por status e/ou prioridade
- Ordenar tarefas (por data, prioridade, etc)
- Paginação
- Loading states durante operações
- Feedback visual de sucesso/erro

O design, layout e componentes ficam totalmente a seu critério.

#### Dashboard de Produtividade

Página com visualizações de dados e métricas de produtividade.
O que esperamos:

- Cards com métricas principais (KPIs)
- Visualizações gráficas dos dados (minimo 3 gráficos)
- Insights sobre produtividade do usuário

O design, escolha de métricas, tipos de gráficos e apresentação visual ficam totalmente a seu critério. Seja criativo e mostre suas habilidades de visualização de dados!

#### Navegação

Implemente navegação clara entre as páginas principais:

- Página de tarefas (CRUD)
- Dashboard de produtividade
- Logout

A estrutura de navegação (sidebar, top nav, etc) fica a seu critério.

#### Gerenciamento de Estado

- Use Zustand ou solução similar para estado global
- Use React Query (ou SWR) para cache e sincronização com API
- Implemente loading states e tratamento de erros
- Rotas protegidas (redirecionar para login se não autenticado)

---

## Requisitos Técnicos

### Backend

- NestJS + TypeScript
- TypeORM + PostgreSQL (ou outro ORM de sua escolha)
- Class Validator para validação
- JWT para autenticação
- RabbitMQ para mensageria
- Redis para cache
- Swagger para documentação da API
- Mínimo 5 testes (Jest ou Vitest)

### Frontend

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS OU Styled Components
- Zustand (ou Context API) para estado global
- React Query (ou SWR) para fetching/cache
- Axios (ou fetch) para HTTP client
- Mínimo 3 testes de componentes
- Rotas protegidas

---

## Entregáveis

1. Repositório Git público no GitHub
2. README.md detalhado incluindo:
   - Descrição do projeto
   - Pré-requisitos
   - Como rodar o projeto (passo a passo)
   - Como rodar os testes
   - Arquitetura e organização do projeto
   - Decisões técnicas e trade-offs
   - Endpoints da API (ou link para Swagger)
   - Diferenciais implementados
   - (Opcional) Como você usou IA no desenvolvimento
3. .env.example com todas as variáveis necessárias
4. Histórico de commits organizado

---

## Diferenciais (Não Obrigatórios - Contam Pontos Extra)

Implemente qualquer um destes para se destacar:

**Arquitetura & Organização:**

- Monorepo muito bem estruturado
- Worker separado para processar fila
- Código/tipos compartilhados entre backend e frontend
- Migrations de banco commitadas

**DevOps & Qualidade:**

- Docker Compose production-ready
- GitHub Actions com CI (lint + testes)
- Deploy funcionando (Railway, Render, Vercel, etc)
- Cobertura de testes alta

**Features:**

- Busca de tarefas (por título/descrição)
- Filtros avançados e combinados
- Drag & Drop para reordenar/organizar tarefas
- Dark mode
- Websockets para atualizações em tempo real
- Refresh token implementation
- Export de dados (CSV, PDF)
- Notificações in-app
- Categorias ou tags para tarefas

**UI/UX:**

- Storybook com componentes
- Animações e transições elegantes
- Gráficos interativos (tooltips, zoom, drill-down)
- Design system bem estruturado
- Acessibilidade (ARIA labels, keyboard navigation)

---

**Desafio Técnico - Loopt | Desenvolvedor Full Stack Pleno**
_Este documento é confidencial e destinado exclusivamente ao candidato._
