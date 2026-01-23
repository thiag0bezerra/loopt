import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Tag } from '../tasks/entities/tag.entity';
import { TaskStatus, TaskPriority } from '@loopt/shared';

/**
 * Dados do usuário de teste
 */
const TEST_USER = {
  email: 'test@loopt.com',
  password: 'test123',
  name: 'Test User',
};

/**
 * Tags de exemplo para o usuário de teste
 */
const TEST_TAGS = [
  { name: 'Trabalho', color: '#ef4444' },
  { name: 'Pessoal', color: '#22c55e' },
  { name: 'Urgente', color: '#f97316' },
  { name: 'Estudo', color: '#3b82f6' },
];

/**
 * Tarefas de exemplo para o usuário de teste
 */
const TEST_TASKS = [
  {
    title: 'Configurar ambiente de desenvolvimento',
    description: 'Instalar todas as dependências e configurar o ambiente local',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: null,
    order: 0,
    tagNames: ['Trabalho'],
  },
  {
    title: 'Revisar documentação da API',
    description: 'Ler e entender a documentação do Swagger',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 dias
    order: 1,
    tagNames: ['Trabalho', 'Estudo'],
  },
  {
    title: 'Implementar nova feature',
    description: 'Desenvolver a funcionalidade de filtros avançados',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
    order: 2,
    tagNames: ['Trabalho', 'Urgente'],
  },
  {
    title: 'Estudar TypeScript avançado',
    description: 'Aprender sobre generics, decorators e utility types',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    dueDate: null,
    order: 3,
    tagNames: ['Pessoal', 'Estudo'],
  },
  {
    title: 'Reunião com o time',
    description: 'Daily standup às 10h',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // +1 dia
    order: 4,
    tagNames: ['Trabalho'],
  },
];

/**
 * Executa o seed do banco de dados
 * Este script é idempotente - pode ser executado múltiplas vezes sem problemas
 */
async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Inicializa a conexão com o banco
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco estabelecida\n');

    const userRepository = AppDataSource.getRepository(User);
    const tagRepository = AppDataSource.getRepository(Tag);
    const taskRepository = AppDataSource.getRepository(Task);

    // Verifica se o usuário de teste já existe
    let user = await userRepository.findOne({
      where: { email: TEST_USER.email },
    });

    if (user) {
      console.log(`⏭️  Usuário de teste já existe: ${TEST_USER.email}`);
    } else {
      // Cria o usuário de teste
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      user = userRepository.create({
        email: TEST_USER.email,
        password: hashedPassword,
        name: TEST_USER.name,
      });
      user = await userRepository.save(user);
      console.log(`✅ Usuário de teste criado: ${TEST_USER.email}`);
    }

    // Cria tags para o usuário (se não existirem)
    const createdTags: Tag[] = [];
    for (const tagData of TEST_TAGS) {
      let tag = await tagRepository.findOne({
        where: { userId: user.id, name: tagData.name },
      });

      if (tag) {
        console.log(`⏭️  Tag já existe: ${tagData.name}`);
      } else {
        tag = tagRepository.create({
          name: tagData.name,
          color: tagData.color,
          userId: user.id,
        });
        tag = await tagRepository.save(tag);
        console.log(`✅ Tag criada: ${tagData.name}`);
      }
      createdTags.push(tag);
    }

    // Cria tarefas para o usuário (se não existirem)
    for (const taskData of TEST_TASKS) {
      const existingTask = await taskRepository.findOne({
        where: { userId: user.id, title: taskData.title },
      });

      if (existingTask) {
        console.log(`⏭️  Tarefa já existe: ${taskData.title}`);
      } else {
        // Encontra as tags associadas a esta tarefa
        const taskTags = createdTags.filter((tag) =>
          taskData.tagNames.includes(tag.name),
        );

        const task = taskRepository.create({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          order: taskData.order,
          userId: user.id,
          tags: taskTags,
          completedAt:
            taskData.status === TaskStatus.COMPLETED ? new Date() : null,
        });
        await taskRepository.save(task);
        console.log(`✅ Tarefa criada: ${taskData.title}`);
      }
    }

    console.log('\n========================================');
    console.log('🎉 Seed concluído com sucesso!');
    console.log('========================================');
    console.log('\n📋 Credenciais do usuário de teste:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Senha: ${TEST_USER.password}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Executa o seed
seed();
