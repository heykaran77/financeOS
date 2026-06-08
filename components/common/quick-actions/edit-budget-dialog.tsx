'use client';

import { useTransition, useState } from 'react';
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
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateBudget } from '@/actions/budget';
import type { BudgetItem } from '@/lib/queries/budget.queries';
import { CATEGORY_ICONS } from '@/lib/icons';

const periodItems = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' },
];

const formSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Amount must be a positive number',
    ),
  period: z.string().min(1, 'Please select a period'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditBudgetDialogProps {
  budget: BudgetItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBudgetDialog({
  budget: budgetData,
  open,
  onOpenChange,
}: EditBudgetDialogProps) {
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
      amount: String(budgetData.limit),
      period: budgetData.period,
    },
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);

    const formData = new FormData();
    formData.set('amount', data.amount.toString());
    formData.set('period', data.period);

    startTransition(async () => {
      const result = await updateBudget(budgetData.id, formData);
      if (result.success) {
        handleOpenChange(false);
        reset();
      } else {
        setServerError(result.message);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update the spending limit for{' '}
            <span className="font-semibold">{budgetData.category}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form className="contents" onSubmit={onSubmit}>
          <DialogPanel className="grid gap-4">
            <Field>
              <FieldLabel>Category</FieldLabel>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm opacity-60">
                {budgetData.color && (
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: budgetData.color ?? undefined }}
                  />
                )}
                {budgetData.categoryIcon &&
                  CATEGORY_ICONS[budgetData.categoryIcon] &&
                  (() => {
                    const Icon = CATEGORY_ICONS[budgetData.categoryIcon];
                    return (
                      <Icon
                        className="size-4"
                        style={{ color: budgetData.color ?? 'inherit' }}
                      />
                    );
                  })()}
                {budgetData.category}
              </div>
            </Field>

            <Controller
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Budget Amount</FieldLabel>
                  <InputGroup>
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
              name="period"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Period</FieldLabel>
                  <Select
                    items={periodItems}
                    value={field.value}
                    onValueChange={(val) =>
                      field.onChange(val || budgetData.period)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectPopup>
                      {periodItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
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
