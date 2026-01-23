'use client';

import * as React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { TaskStatus, TaskPriority, type Task } from '@loopt/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

/**
 * Mapeamento de status para labels em português
 */
const statusLabelMap: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pendente',
  [TaskStatus.IN_PROGRESS]: 'Em Progresso',
  [TaskStatus.COMPLETED]: 'Concluída',
};

/**
 * Mapeamento de prioridade para labels em português
 */
const priorityLabelMap: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Baixa',
  [TaskPriority.MEDIUM]: 'Média',
  [TaskPriority.HIGH]: 'Alta',
};

/**
 * Props do componente ExportButton
 */
export interface ExportButtonProps {
  /** Tarefas a serem exportadas */
  tasks: Task[];
  /** Filtros aplicados (para incluir no cabeçalho do PDF) */
  filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  };
  /** Se está desabilitado (ex: sem tarefas) */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Formata data para exibição
 * @param date - Data a ser formatada
 * @returns String formatada ou vazio se nulo
 */
function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Gera e baixa um arquivo CSV com as tarefas
 * @param tasks - Tarefas a serem exportadas
 */
function exportToCSV(tasks: Task[]): void {
  // Cabeçalhos do CSV
  const headers = [
    'Título',
    'Descrição',
    'Status',
    'Prioridade',
    'Data de Vencimento',
    'Data de Criação',
    'Data de Conclusão',
  ];

  // Converte tarefas para linhas CSV
  const rows = tasks.map((task) => [
    // Escapa aspas duplas e envolve em aspas se contém vírgula ou quebra de linha
    `"${(task.title || '').replace(/"/g, '""')}"`,
    `"${(task.description || '').replace(/"/g, '""')}"`,
    statusLabelMap[task.status],
    priorityLabelMap[task.priority],
    formatDate(task.dueDate),
    formatDate(task.createdAt),
    formatDate(task.completedAt),
  ]);

  // Monta o conteúdo CSV
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Adiciona BOM para suporte a caracteres especiais no Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  // Cria link de download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `tarefas_${new Date().toISOString().split('T')[0]}.csv`,
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success('Arquivo CSV exportado com sucesso!');
}

/**
 * Gera e baixa um arquivo PDF com as tarefas
 * @param tasks - Tarefas a serem exportadas
 * @param filters - Filtros aplicados para incluir no cabeçalho
 */
function exportToPDF(
  tasks: Task[],
  filters?: ExportButtonProps['filters'],
): void {
  // Cria novo documento PDF
  const doc = new jsPDF();

  // Título do documento
  doc.setFontSize(18);
  doc.text('Relatório de Tarefas', 14, 22);

  // Data de geração
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    14,
    30,
  );

  // Filtros aplicados (se houver)
  let yPos = 36;
  if (filters) {
    const appliedFilters: string[] = [];
    if (filters.status) {
      appliedFilters.push(`Status: ${statusLabelMap[filters.status]}`);
    }
    if (filters.priority) {
      appliedFilters.push(`Prioridade: ${priorityLabelMap[filters.priority]}`);
    }
    if (filters.search) {
      appliedFilters.push(`Busca: "${filters.search}"`);
    }

    if (appliedFilters.length > 0) {
      doc.text(`Filtros: ${appliedFilters.join(' | ')}`, 14, yPos);
      yPos += 6;
    }
  }

  // Total de tarefas
  doc.text(`Total: ${tasks.length} tarefa(s)`, 14, yPos);
  yPos += 8;

  // Prepara dados para a tabela
  const tableData = tasks.map((task) => [
    task.title,
    task.description || '-',
    statusLabelMap[task.status],
    priorityLabelMap[task.priority],
    formatDate(task.dueDate),
    formatDate(task.completedAt),
  ]);

  // Gera tabela usando autoTable
  autoTable(doc, {
    startY: yPos,
    head: [
      [
        'Título',
        'Descrição',
        'Status',
        'Prioridade',
        'Vencimento',
        'Conclusão',
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Título
      1: { cellWidth: 50 }, // Descrição
      2: { cellWidth: 25 }, // Status
      3: { cellWidth: 22 }, // Prioridade
      4: { cellWidth: 25 }, // Vencimento
      5: { cellWidth: 25 }, // Conclusão
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    didDrawCell: (data) => {
      // Colore células de status
      if (data.column.index === 2 && data.section === 'body') {
        const status = tasks[data.row.index]?.status;
        if (status === TaskStatus.COMPLETED) {
          doc.setTextColor(34, 197, 94); // Verde
        } else if (status === TaskStatus.IN_PROGRESS) {
          doc.setTextColor(59, 130, 246); // Azul
        } else {
          doc.setTextColor(100, 116, 139); // Cinza
        }
      }
      // Colore células de prioridade
      if (data.column.index === 3 && data.section === 'body') {
        const priority = tasks[data.row.index]?.priority;
        if (priority === TaskPriority.HIGH) {
          doc.setTextColor(239, 68, 68); // Vermelho
        } else if (priority === TaskPriority.MEDIUM) {
          doc.setTextColor(245, 158, 11); // Amarelo
        } else {
          doc.setTextColor(100, 116, 139); // Cinza
        }
      }
    },
    didParseCell: () => {
      doc.setTextColor(0); // Reset cor do texto
    },
  });

  // Salva o PDF
  doc.save(`tarefas_${new Date().toISOString().split('T')[0]}.pdf`);

  toast.success('Arquivo PDF exportado com sucesso!');
}

/**
 * Botão de exportação de tarefas com opções de CSV e PDF
 *
 * @example
 * ```tsx
 * <ExportButton
 *   tasks={tasks}
 *   filters={{ status: TaskStatus.PENDING }}
 * />
 * ```
 */
export function ExportButton({
  tasks,
  filters,
  disabled,
  className,
}: ExportButtonProps) {
  const isEmpty = tasks.length === 0;

  /**
   * Manipula exportação para CSV
   */
  const handleExportCSV = () => {
    exportToCSV(tasks);
  };

  /**
   * Manipula exportação para PDF
   */
  const handleExportPDF = () => {
    exportToPDF(tasks, filters);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isEmpty}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
