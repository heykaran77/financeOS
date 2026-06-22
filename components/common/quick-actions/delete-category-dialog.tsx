'use client';

import { useTransition, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteCategory } from '@/actions/category';

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
}: DeleteCategoryDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setServerError(null);
    }
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleDelete = () => {
    setServerError(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        handleOpenChange(false);
      } else {
        setServerError(result.message);
      }
    });
  };

  const dialogContent = (
    <DialogPopup className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the &quot;{categoryName}&quot;
          category? Any budgets and transactions using this category might be
          affected.
        </DialogDescription>
      </DialogHeader>

      <DialogPanel>
        {serverError && (
          <div className="text-destructive mt-2 text-sm font-medium">
            {serverError}
          </div>
        )}
      </DialogPanel>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button
          variant="destructive"
          onClick={handleDelete}
          loading={isPending}
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogPopup>
  );

  if (withTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {trigger ? (
          <DialogTrigger render={trigger as React.ReactElement} />
        ) : (
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
              />
            }
          >
            <Trash2 className="size-4" />
          </DialogTrigger>
        )}
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
