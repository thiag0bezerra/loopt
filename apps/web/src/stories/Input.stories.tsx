import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

/**
 * O componente Input é usado para entrada de dados do usuário.
 * Suporta todos os tipos de input HTML padrão.
 */
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'O tipo do input',
    },
    placeholder: {
      control: 'text',
      description: 'Texto de placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado do input',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Input padrão com placeholder */
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Digite algo...',
  },
};

/** Input do tipo email */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@exemplo.com',
  },
};

/** Input do tipo password */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '••••••••',
  },
};

/** Input desabilitado */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Desabilitado',
    value: 'Não pode editar',
  },
};

/** Input com valor preenchido */
export const WithValue: Story = {
  args: {
    type: 'text',
    defaultValue: 'Valor inicial',
  },
};

/** Input com label usando composição */
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="email@exemplo.com" />
    </div>
  ),
};

/** Input com estado de erro (estilização customizada) */
export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="error-input">Email</Label>
      <Input
        type="email"
        id="error-input"
        placeholder="email@exemplo.com"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">Email inválido</p>
    </div>
  ),
};

/** Input do tipo busca */
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Buscar...',
  },
};
