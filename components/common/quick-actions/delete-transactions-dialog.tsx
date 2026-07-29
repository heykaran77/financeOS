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
import { deleteTransactions } from '@/actions/transaction';

interface DeleteTransactionsDialogProps {
  transactionIds: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
}

export function DeleteTransactionsDialog({
  transactionIds,
  open,
  onOpenChange,
  onSuccess,
  withTrigger = false,
  trigger,
}: DeleteTransactionsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const count = transactionIds.length;

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
      const result = await deleteTransactions(transactionIds);
      if (result.success) {
        handleOpenChange(false);
        onSuccess?.();
      } else {
        setServerError(result.message);
      }
    });
  };

  const dialogContent = (
    <DialogPopup className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete Transactions</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {count} selected transaction
          {count === 1 ? '' : 's'}? This will revert the associated bank account
          balances. This action cannot be undone.
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
