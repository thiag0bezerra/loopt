import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckSquare, AlertTriangle, Clock, Target } from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';

describe('KPICard', () => {
  it('deve renderizar título corretamente', () => {
    render(<KPICard title="Total de Tarefas" value={42} icon={CheckSquare} />);

    expect(screen.getByText('Total de Tarefas')).toBeInTheDocument();
  });

  it('deve renderizar valor numérico corretamente', () => {
    render(<KPICard title="Total de Tarefas" value={42} icon={CheckSquare} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('deve renderizar valor string corretamente', () => {
    render(<KPICard title="Taxa de Conclusão" value="85%" icon={Target} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('deve renderizar descrição quando fornecida', () => {
    render(
      <KPICard
        title="Tarefas Concluídas"
        value={15}
        icon={CheckSquare}
        description="nos últimos 7 dias"
      />,
    );

    expect(screen.getByText('nos últimos 7 dias')).toBeInTheDocument();
  });

  it('deve renderizar trend up com cor verde', () => {
    const { container } = render(
      <KPICard
        title="Produtividade"
        value={120}
        icon={Target}
        trend={{ direction: 'up', value: '+15%' }}
      />,
    );

    expect(screen.getByText('+15%')).toBeInTheDocument();
    // Verificar que tem a classe text-green-500
    const trendElement = container.querySelector('.text-green-500');
    expect(trendElement).toBeInTheDocument();
  });

  it('deve renderizar trend down com cor vermelha', () => {
    const { container } = render(
      <KPICard
        title="Tarefas Pendentes"
        value={8}
        icon={Clock}
        trend={{ direction: 'down', value: '-20%' }}
      />,
    );

    expect(screen.getByText('-20%')).toBeInTheDocument();
    // Verificar que tem a classe text-red-500
    const trendElement = container.querySelector('.text-red-500');
    expect(trendElement).toBeInTheDocument();
  });

  it('deve renderizar trend neutral sem cor específica', () => {
    render(
      <KPICard
        title="Tarefas Atrasadas"
        value={0}
        icon={AlertTriangle}
        trend={{ direction: 'neutral', value: '0%' }}
      />,
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('deve renderizar ícone', () => {
    const { container } = render(
      <KPICard title="Total de Tarefas" value={42} icon={CheckSquare} />,
    );

    // Verificar que existe um SVG (ícone lucide) no card
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('deve aplicar className adicional', () => {
    const { container } = render(
      <KPICard
        title="Total de Tarefas"
        value={42}
        icon={CheckSquare}
        className="custom-class"
      />,
    );

    // O primeiro elemento é o Card
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });
});
