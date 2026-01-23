import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Mail, ChevronRight } from 'lucide-react';

/**
 * O componente Button é usado para ações do usuário.
 * Suporta múltiplas variantes, tamanhos e estados.
 */
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'A variante visual do botão',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'O tamanho do botão',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado do botão',
    },
    asChild: {
      control: 'boolean',
      description: 'Se true, renderiza o filho diretamente',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Variante padrão do botão */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

/** Variante destructive para ações perigosas */
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

/** Variante outline com borda */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

/** Variante secondary */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

/** Variante ghost sem fundo */
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

/** Variante link estilizado como texto */
export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

/** Botão com ícone à esquerda */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail /> Login com Email
      </>
    ),
  },
};

/** Botão com estado de loading */
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="animate-spin" />
        Aguarde...
      </>
    ),
  },
};

/** Botão apenas com ícone */
export const IconOnly: Story = {
  args: {
    size: 'icon',
    children: <ChevronRight />,
    'aria-label': 'Próximo',
  },
};

/** Botão desabilitado */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

/** Todas as variantes lado a lado */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
