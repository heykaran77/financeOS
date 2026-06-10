'use client';

import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { updateGoal } from '@/actions/goal';
import type { GoalItem } from '@/lib/queries/goal.queries';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  targetAmount: z
    .string()
    .min(1, 'Target amount is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Target amount must be a positive number',
    ),
  targetDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditGoalDialogProps {
  goal: GoalItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalDialog({
  goal: goalData,
  open,
  onOpenChange,
}: EditGoalDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setServerError(null);
    }
    onOpenChange(newOpen);
  };

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goalData.name,
      description: goalData.description || '',
      targetAmount: String(goalData.target),
      targetDate: goalData.targetDate
        ? goalData.targetDate.toISOString().split('T')[0]
        : '',
    },
  });

  // Sync default values if goalData updates while closed
  useEffect(() => {
    if (open) {
      reset({
        name: goalData.name,
        description: goalData.description || '',
        targetAmount: String(goalData.target),
        targetDate: goalData.targetDate
          ? goalData.targetDate.toISOString().split('T')[0]
          : '',
      });
    }
  }, [open, goalData, reset]);

  const onSubmit = handleSubmit((data) => {
    setServerError(null);

    const formData = new FormData();
    formData.set('name', data.name);
    if (data.description) formData.set('description', data.description);
    formData.set('targetAmount', data.targetAmount);
    if (data.targetDate) formData.set('targetDate', data.targetDate);

    startTransition(async () => {
      const result = await updateGoal(goalData.id, formData);
      if (result.success) {
        handleOpenChange(false);
      } else {
        setServerError(result.message);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update the details for your financial goal.
          </DialogDescription>
        </DialogHeader>
        <Form className="contents" onSubmit={onSubmit}>
          <DialogPanel className="grid gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input {...field} type="text" />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Description (optional)</FieldLabel>
                  <Textarea {...field} rows={2} />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="targetAmount"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Target Amount</FieldLabel>
                  <InputGroup className="px-2">
                    <InputGroupText>₹</InputGroupText>
                    <InputGroupInput
                      {...field}
                      type="number"
                      min="1"
                      step="0.01"
                    />
                  </InputGroup>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="targetDate"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Target Date (optional)</FieldLabel>
                  <Input {...field} type="date" />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {serverError && <FieldError>{serverError}</FieldError>}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button type="submit" loading={isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
