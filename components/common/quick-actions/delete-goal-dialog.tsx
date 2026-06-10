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
import { deleteGoal } from '@/actions/goal';

interface DeleteGoalDialogProps {
  goalId: string;
  goalName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGoalDialog({
  goalId,
  goalName,
  open,
  onOpenChange,
}: DeleteGoalDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteGoal(goalId);
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
          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="text-foreground font-semibold">{goalName}</span>?
            This action cannot be undone and will not affect any transactions.
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
            Delete Goal
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
