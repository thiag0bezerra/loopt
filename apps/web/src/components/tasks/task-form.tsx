'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@loopt/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/hooks/use-tags';

/**
 * Schema de validação para o formulário de tarefa
 */
const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.date().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

/**
 * Tipo inferido do schema de validação
 */
export type TaskFormValues = z.infer<typeof taskFormSchema>;

/**
 * Mapeamento de status para labels em português
 */
const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: TaskStatus.PENDING, label: 'Pendente' },
  { value: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
  { value: TaskStatus.COMPLETED, label: 'Concluída' },
];

/**
 * Mapeamento de prioridade para labels em português
 */
const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: TaskPriority.LOW, label: 'Baixa' },
  { value: TaskPriority.MEDIUM, label: 'Média' },
  { value: TaskPriority.HIGH, label: 'Alta' },
];

/**
 * Props do componente TaskForm
 */
export interface TaskFormProps {
  /** Dados iniciais para modo de edição */
  initialData?: Partial<TaskFormValues>;
  /** Callback ao submeter o formulário */
  onSubmit: (data: TaskFormValues) => void | Promise<void>;
  /** Indica se o formulário está em estado de carregamento */
  isLoading?: boolean;
  /** Texto do botão de submit */
  submitLabel?: string;
  /** Lista de tags disponíveis para seleção */
  availableTags?: Tag[];
  /** Indica se está carregando as tags */
  isLoadingTags?: boolean;
}

/**
 * Formulário para criação e edição de tarefas
 *
 * @example
 * ```tsx
 * // Modo criação
 * <TaskForm
 *   onSubmit={(data) => createTask(data)}
 *   isLoading={isCreating}
 *   submitLabel="Criar Tarefa"
 *   availableTags={tags}
 * />
 *
 * // Modo edição
 * <TaskForm
 *   initialData={{
 *     title: task.title,
 *     description: task.description,
 *     status: task.status,
 *     priority: task.priority,
 *     dueDate: task.dueDate,
 *     tagIds: task.tags?.map(t => t.id),
 *   }}
 *   onSubmit={(data) => updateTask(data)}
 *   isLoading={isUpdating}
 *   submitLabel="Salvar Alterações"
 *   availableTags={tags}
 * />
 * ```
 */
export function TaskForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
  availableTags = [],
  isLoadingTags = false,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? TaskStatus.PENDING,
      priority: initialData?.priority ?? TaskPriority.MEDIUM,
      dueDate: initialData?.dueDate ?? null,
      tagIds: initialData?.tagIds ?? [],
    },
  });

  /**
   * Manipula a submissão do formulário
   */
  const handleSubmit = async (data: TaskFormValues) => {
    await onSubmit(data);
  };

  /**
   * Adiciona uma tag à seleção
   */
  const handleAddTag = (tagId: string) => {
    const currentTags = form.getValues('tagIds') ?? [];
    if (!currentTags.includes(tagId)) {
      form.setValue('tagIds', [...currentTags, tagId], { shouldDirty: true });
    }
  };

  /**
   * Remove uma tag da seleção
   */
  const handleRemoveTag = (tagId: string) => {
    const currentTags = form.getValues('tagIds') ?? [];
    form.setValue(
      'tagIds',
      currentTags.filter((id) => id !== tagId),
      { shouldDirty: true },
    );
  };

  const selectedTagIds = form.watch('tagIds') ?? [];
  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id),
  );
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTagIds.includes(tag.id),
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Campo Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o título da tarefa"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes da tarefa (opcional)"
                  className="min-h-25 resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>Máximo de 1000 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status e Prioridade em linha */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Campo Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Prioridade */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo Data de Vencimento */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Vencimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {field.value ? (
                        format(field.value, "d 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })
                      ) : (
                        <span>Selecione uma data (opcional)</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    initialFocus
                    locale={ptBR}
                  />
                  {field.value && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => field.onChange(null)}
                      >
                        Limpar data
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <FormDescription>
                Opcional. Define quando a tarefa deve ser concluída.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Tags */}
        <FormField
          control={form.control}
          name="tagIds"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-3">
                {/* Tags selecionadas */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer"
                        style={{
                          backgroundColor: tag.color + '20',
                          borderColor: tag.color,
                        }}
                        onClick={() => handleRemoveTag(tag.id)}
                      >
                        <span style={{ color: tag.color }}>{tag.name}</span>
                        <X className="ml-1 size-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Seletor de tags */}
                {!isLoadingTags && unselectedTags.length > 0 && (
                  <Select onValueChange={handleAddTag} value="">
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Adicionar tag..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unselectedTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="size-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {isLoadingTags && (
                  <p className="text-muted-foreground text-sm">
                    Carregando tags...
                  </p>
                )}

                {!isLoadingTags && availableTags.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma tag disponível. Crie uma nova tag para categorizar
                    suas tarefas.
                  </p>
                )}
              </div>
              <FormDescription>
                Opcional. Use tags para organizar suas tarefas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botão Submit */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
