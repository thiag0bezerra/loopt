'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { TagBadge, type TagBadgeTag } from './tag-badge';
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/hooks/use-tags';

/**
 * Cores pré-definidas para seleção de tags
 */
const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

/**
 * Props do componente ColorPicker
 */
interface ColorPickerProps {
  /** Cor selecionada atualmente */
  value: string;
  /** Callback ao selecionar uma cor */
  onChange: (color: string) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente de seleção de cor para tags
 */
function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>Cor</Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              'h-8 w-8 rounded-full border-2 transition-all',
              value === color
                ? 'border-foreground scale-110'
                : 'border-transparent hover:scale-105',
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Selecionar cor ${color}`}
          />
        ))}
      </div>
      {/* Input customizado para cor */}
      <div className="flex items-center gap-2 mt-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#6366f1"
          className="flex-1 font-mono text-sm"
          maxLength={7}
        />
      </div>
    </div>
  );
}

/**
 * Props do formulário de tag
 */
interface TagFormProps {
  /** Nome inicial da tag */
  initialName?: string;
  /** Cor inicial da tag */
  initialColor?: string;
  /** Callback ao submeter o formulário */
  onSubmit: (name: string, color: string) => void;
  /** Callback ao cancelar */
  onCancel: () => void;
  /** Se está carregando */
  isLoading?: boolean;
  /** Texto do botão de submit */
  submitLabel?: string;
}

/**
 * Formulário para criar/editar tag
 */
function TagForm({
  initialName = '',
  initialColor = '#6366f1',
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Salvar',
}: TagFormProps) {
  const [name, setName] = React.useState(initialName);
  const [color, setColor] = React.useState(initialColor);

  /**
   * Manipula o submit do formulário
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), color);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name">Nome</Label>
        <Input
          id="tag-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da tag"
          maxLength={50}
          required
          disabled={isLoading}
        />
      </div>

      <ColorPicker value={color} onChange={setColor} />

      <div className="flex items-center gap-2 pt-2">
        <div className="text-sm text-muted-foreground">Preview:</div>
        <TagBadge tag={{ id: 'preview', name: name || 'Tag', color }} />
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Props do componente TagManager
 */
export interface TagManagerProps {
  /** Se deve exibir o trigger padrão */
  showTrigger?: boolean;
  /** Componente trigger customizado */
  trigger?: React.ReactNode;
  /** Controle externo de abertura */
  open?: boolean;
  /** Callback ao mudar estado de abertura */
  onOpenChange?: (open: boolean) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente de gerenciamento de tags
 *
 * Permite criar, editar e deletar tags do usuário.
 * Exibe um modal com lista de tags e opções de gerenciamento.
 *
 * @example
 * ```tsx
 * // Com trigger padrão
 * <TagManager />
 *
 * // Com trigger customizado
 * <TagManager trigger={<Button>Gerenciar Tags</Button>} />
 *
 * // Controlado externamente
 * <TagManager open={isOpen} onOpenChange={setIsOpen} />
 * ```
 */
export function TagManager({
  showTrigger = true,
  trigger,
  open: controlledOpen,
  onOpenChange,
  className,
}: TagManagerProps) {
  // Estado interno de abertura (para modo não controlado)
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  // Estado do formulário de criação/edição
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<TagBadgeTag | null>(null);
  const [deletingTag, setDeletingTag] = React.useState<TagBadgeTag | null>(
    null,
  );

  // Hooks de dados
  const { data: tags = [], isLoading: isLoadingTags } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  /**
   * Manipula a criação de uma nova tag
   */
  const handleCreate = (name: string, color: string) => {
    createTag.mutate(
      { name, color },
      {
        onSuccess: () => {
          setIsCreating(false);
        },
      },
    );
  };

  /**
   * Manipula a atualização de uma tag
   */
  const handleUpdate = (name: string, color: string) => {
    if (!editingTag) return;

    updateTag.mutate(
      { id: editingTag.id, data: { name, color } },
      {
        onSuccess: () => {
          setEditingTag(null);
        },
      },
    );
  };

  /**
   * Manipula a confirmação de deleção
   */
  const handleConfirmDelete = () => {
    if (!deletingTag) return;

    deleteTag.mutate(deletingTag.id, {
      onSuccess: () => {
        setDeletingTag(null);
      },
    });
  };

  /**
   * Reseta os estados ao fechar o modal
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsCreating(false);
      setEditingTag(null);
      setDeletingTag(null);
    }
    setOpen(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            {trigger || (
              <Button variant="outline" size="sm" className={className}>
                <Tag className="mr-2 h-4 w-4" />
                Gerenciar Tags
              </Button>
            )}
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Tags</DialogTitle>
            <DialogDescription>
              Crie e organize suas tags para categorizar tarefas.
            </DialogDescription>
          </DialogHeader>

          {/* Lista de tags ou formulário */}
          {isCreating ? (
            <TagForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
              isLoading={createTag.isPending}
              submitLabel="Criar Tag"
            />
          ) : editingTag ? (
            <TagForm
              initialName={editingTag.name}
              initialColor={editingTag.color}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTag(null)}
              isLoading={updateTag.isPending}
              submitLabel="Salvar Alterações"
            />
          ) : (
            <div className="space-y-4">
              {/* Lista de tags */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {isLoadingTags ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma tag criada ainda.</p>
                    <p className="text-xs">
                      Clique no botão abaixo para criar sua primeira tag.
                    </p>
                  </div>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <TagBadge tag={tag} size="md" />

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingTag(tag)}
                          aria-label={`Editar tag ${tag.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingTag(tag)}
                          aria-label={`Excluir tag ${tag.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botão de criar */}
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Tag
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de confirmação de deleção */}
      <AlertDialog
        open={!!deletingTag}
        onOpenChange={() => setDeletingTag(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tag</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tag{' '}
              <strong>{deletingTag?.name}</strong>? Esta ação não pode ser
              desfeita e a tag será removida de todas as tarefas associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTag.isPending}
            >
              {deleteTag.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
