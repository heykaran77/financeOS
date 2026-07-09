'use client';

import { useState, useTransition, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  PlusIcon,
  RepeatIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from 'lucide-react';

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
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverPopup } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toastManager } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

import {
  AddRecurringTransactionSchema,
  type AddRecurringTransactionSchemaType,
  FREQUENCY_LABELS,
  type Frequency,
} from '@/types/recurringSchema';
import { createRecurringTransaction } from '@/actions/recurring';
import { CATEGORY_ICONS } from '@/lib/icons';
import type {
  BankAccountRow,
  CategoryRow,
} from '@/lib/queries/account.queries';
import { getTransactionFormData } from '@/actions/form-data';

// ─── Category Icon Helper ────────────────────────────────────────

function CategoryIcon({
  icon,
  className,
}: {
  icon: string | null;
  className?: string;
}) {
  if (!icon) return null;
  const LucideIcon = CATEGORY_ICONS[icon];
  if (LucideIcon)
    return <LucideIcon className={cn('size-4 shrink-0', className)} />;
  return <span>{icon}</span>;
}

// ─── Frequency Items ─────────────────────────────────────────────

const frequencyItems = (
  Object.entries(FREQUENCY_LABELS) as [Frequency, string][]
).map(([value, label]) => ({ value, label }));

// ─── Main Dialog ─────────────────────────────────────────────────

interface AddRecurringDialogProps {
  accounts?: BankAccountRow[];
  categories?: CategoryRow[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
}

export function AddRecurringDialog({
  accounts: propAccounts,
  categories: propCategories,
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
}: AddRecurringDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  // Lazy-load form data when not pre-supplied
  const [accounts, setAccounts] = useState<BankAccountRow[]>(
    propAccounts ?? [],
  );
  const [categories, setCategories] = useState<CategoryRow[]>(
    propCategories ?? [],
  );
  const [dataLoaded, setDataLoaded] = useState(
    propAccounts !== undefined && propCategories !== undefined,
  );

  useEffect(() => {
    if (isOpen && !dataLoaded) {
      getTransactionFormData().then(({ accounts: a, categories: c }) => {
        setAccounts(a);
        setCategories(c);
        setDataLoaded(true);
      });
    }
  }, [isOpen, dataLoaded]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setServerError(null);
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const form = useForm<AddRecurringTransactionSchemaType>({
    resolver: zodResolver(AddRecurringTransactionSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      type: 'expense',
      frequency: 'monthly',
      nextDueDate: new Date(),
      bankAccountId: '',
      categoryId: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() is intentionally reactive
  const selectedType = form.watch('type');

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = form.handleSubmit(
    (data: AddRecurringTransactionSchemaType) => {
      setServerError(null);

      startTransition(async () => {
        const result = await createRecurringTransaction(data);
        if (result.success) {
          toastManager.add({
            title: 'Recurring transaction created',
            description: result.message,
            type: 'success',
          });
          handleOpenChange(false);
          form.reset();
        } else {
          setServerError(result.message);
        }
      });
    },
  );

  const dialogContent = (
    <DialogPopup className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Recurring Transaction</DialogTitle>
        <DialogDescription>
          Set up a recurring expense or income like subscriptions, rent, or
          salary.
        </DialogDescription>
      </DialogHeader>
      <Form className="contents" onSubmit={onSubmit}>
        <DialogPanel className="grid gap-4">
          {/* Type toggle */}
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Field>
                <FieldLabel>Type</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange('expense');
                      form.setValue('categoryId', '');
                    }}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      field.value === 'expense'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <TrendingDownIcon className="size-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange('income');
                      form.setValue('categoryId', '');
                    }}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      field.value === 'income'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <TrendingUpIcon className="size-4" />
                    Income
                  </button>
                </div>
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. Netflix, Rent, Salary"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Amount + Frequency row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Amount</FieldLabel>
                  <InputGroup className="px-2">
                    <InputGroupText>₹</InputGroupText>
                    <InputGroupInput
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(
                          val === '' ? undefined : parseFloat(val),
                        );
                      }}
                    />
                  </InputGroup>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="frequency"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Frequency</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val || 'monthly')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectPopup>
                      {frequencyItems.map((item) => (
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
          </div>

          {/* Next Due Date */}
          <Controller
            control={form.control}
            name="nextDueDate"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Next Due Date</FieldLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        data-invalid={fieldState.invalid ? '' : undefined}
                        className={cn(
                          'border-input bg-background text-foreground hover:bg-accent flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm shadow-xs/5 transition-colors',
                          !field.value && 'text-muted-foreground',
                        )}
                      />
                    }
                  >
                    <span>
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                    </span>
                    <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
                  </PopoverTrigger>
                  <PopoverPopup align="start" side="bottom" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverPopup>
                </Popover>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Account + Category row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Account{' '}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(val) =>
                      field.onChange(!val || val === '' ? undefined : val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      {(() => {
                        const acc = accounts.find((a) => a.id === field.value);
                        return acc ? (
                          <span className="flex flex-1 items-center gap-1.5 truncate">
                            {acc.icon && <span>{acc.icon}</span>}
                            <span className="truncate">{acc.name}</span>
                          </span>
                        ) : (
                          <SelectValue placeholder="Select account" />
                        );
                      })()}
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="">
                        <span className="text-muted-foreground">None</span>
                      </SelectItem>
                      <SelectSeparator />
                      {accounts.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          No accounts found
                        </SelectItem>
                      ) : (
                        accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <span className="flex items-center gap-2">
                              {account.icon && <span>{account.icon}</span>}
                              <span>{account.name}</span>
                              <span className="text-muted-foreground text-xs">
                                · {account.type.replace('_', ' ')}
                              </span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectPopup>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Category{' '}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(val) =>
                      field.onChange(!val || val === '' ? undefined : val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      {(() => {
                        const cat = filteredCategories.find(
                          (c) => c.id === field.value,
                        );
                        return cat ? (
                          <span className="flex flex-1 items-center gap-1.5 truncate">
                            <CategoryIcon icon={cat.icon} />
                            <span className="truncate">{cat.name}</span>
                          </span>
                        ) : (
                          <SelectValue placeholder="Select category" />
                        );
                      })()}
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="">
                        <span className="text-muted-foreground">None</span>
                      </SelectItem>
                      <SelectSeparator />
                      {filteredCategories.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          No categories found
                        </SelectItem>
                      ) : (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <CategoryIcon icon={cat.icon} />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectPopup>
                  </Select>
                </Field>
              )}
            />
          </div>

          {serverError && <FieldError>{serverError}</FieldError>}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button type="submit" loading={isPending}>
            Create Recurring
          </Button>
        </DialogFooter>
      </Form>
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
                id="add-recurring-btn"
                variant="outline"
                className="gap-2 text-sm font-medium tracking-tight"
              />
            }
          >
            <RepeatIcon className="size-4" />
            Add Recurring
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
