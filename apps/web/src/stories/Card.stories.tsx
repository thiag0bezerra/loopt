import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

/**
 * O componente Card é um container para agrupar conteúdos relacionados.
 * Composto por CardHeader, CardTitle, CardDescription, CardContent e CardFooter.
 */
const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Card básico com título e descrição */
export const Default: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>
          Descrição do card explicando o conteúdo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Conteúdo principal do card vai aqui.</p>
      </CardContent>
    </Card>
  ),
};

/** Card com formulário de login */
export const LoginForm: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Entre com suas credenciais</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button>Entrar</Button>
      </CardFooter>
    </Card>
  ),
};

/** Card com footer */
export const WithFooter: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Você tem 3 notificações não lidas.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Confira suas mensagens e atualizações recentes.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Ver todas</Button>
      </CardFooter>
    </Card>
  ),
};

/** Card simples sem header */
export const Simple: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardContent className="pt-6">
        <p>Um card simples apenas com conteúdo.</p>
      </CardContent>
    </Card>
  ),
};

/** Card com tarefas (exemplo de lista) */
export const TaskCard: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Minhas Tarefas</CardTitle>
        <CardDescription>Você tem 5 tarefas pendentes</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Revisar código</span>
          </li>
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Escrever documentação</span>
          </li>
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="line-through text-muted-foreground">
              Criar componentes
            </span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Adicionar tarefa
        </Button>
      </CardFooter>
    </Card>
  ),
};
