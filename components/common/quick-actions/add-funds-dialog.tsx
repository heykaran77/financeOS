'use client';

import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { addFundsToGoal } from '@/actions/goal';
import type { GoalItem } from '@/lib/queries/goal.queries';
import type { BankAccountRow } from '@/lib/queries/account.queries';

const formSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Amount must be a positive number',
    ),
  bankAccountId: z.string().min(1, 'Source account is required'),
  bankName: z.string().min(1, 'Bank Name is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFundsDialogProps {
  goal: GoalItem;
  bankAccounts: BankAccountRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsDialog({
  goal: goalData,
  bankAccounts,
  open,
  onOpenChange,
}: AddFundsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setServerError(null);
    }
    onOpenChange(newOpen);
  };

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      bankAccountId: '',
      bankName: '',
    },
  });

  const selectedBankName = useWatch({
    control,
    name: 'bankName',
  });

  useEffect(() => {
    if (open) {
      reset({ amount: '', bankAccountId: '', bankName: '' });
    }
  }, [open, reset]);

  const onSubmit = handleSubmit((data) => {
    setServerError(null);

    startTransition(async () => {
      const result = await addFundsToGoal(
        goalData.id,
        data.amount,
        data.bankAccountId,
      );
      if (result.success) {
        handleOpenChange(false);
      } else {
        setServerError(result.message);
      }
    });
  });

  const remaining = Math.max(0, goalData.target - goalData.current);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add money to your{' '}
            <span className="text-foreground font-semibold">
              {goalData.name}
            </span>{' '}
            goal from a bank account.
          </DialogDescription>
        </DialogHeader>
        <Form className="contents" onSubmit={onSubmit}>
          <DialogPanel className="grid gap-4">
            <Controller
              control={control}
              name="bankAccountId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Source Account</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      const acc = bankAccounts.find((a) => a.id === val);
                      if (acc) {
                        setValue('bankName', acc.name, {
                          shouldValidate: true,
                        });
                      } else {
                        setValue('bankName', '', { shouldValidate: true });
                      }
                    }}
                  >
                    <SelectTrigger>
                      {field.value ? (
                        <span className="flex-1 truncate text-left">
                          {selectedBankName}
                        </span>
                      ) : (
                        <SelectValue placeholder="Select an account" />
                      )}
                    </SelectTrigger>
                    <SelectPopup>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex w-full items-center justify-between gap-4">
                            <span>{account.name}</span>
                            <span className="text-muted-foreground text-xs tabular-nums">
                              ₹
                              {parseFloat(account.balance).toLocaleString(
                                'en-IN',
                                { minimumFractionDigits: 2 },
                              )}
                            </span>
                          </div>
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

            <Controller
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Amount to Add</FieldLabel>
                  <InputGroup className="px-2">
                    <InputGroupText>₹</InputGroupText>
                    <InputGroupInput
                      {...field}
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder={remaining.toFixed(2)}
                    />
                  </InputGroup>
                  <FieldDescription>
                    Remaining to reach goal: ₹{remaining.toLocaleString()}
                  </FieldDescription>
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
              Add Funds
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
