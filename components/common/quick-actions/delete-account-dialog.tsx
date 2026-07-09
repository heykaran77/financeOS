'use client';

import { useTransition, useState } from 'react';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { archiveAccount } from '@/actions/account';

interface DeleteAccountDialogProps {
  accountId: string;
  accountName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  accountId,
  accountName,
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await archiveAccount(accountId);
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your{' '}
            <span className="font-semibold">{accountName}</span> account? This
            will hide it from your active list without deleting transaction
            history.
          </AlertDialogDescription>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>
            Cancel
          </AlertDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
            type="button"
          >
            Delete Account
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
