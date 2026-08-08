'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  PlusIcon,
  UploadIcon,
  ArrowRightLeftIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FileSpreadsheetIcon,
  InfoIcon,
  AlertTriangleIcon,
  Clock,
} from 'lucide-react';

import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogPanel,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverPopup } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toastManager } from '@/components/ui/toast';
import Spinner from '@/components/common/unicodeSpinner';
import { cn } from '@/lib/utils';

import {
  AddTransactionSchema,
  type AddTransactionSchemaType,
  type TransactionType,
} from '@/types/transactionSchema';
import { createTransaction } from '@/actions/transaction';
import { CATEGORY_ICONS } from '@/lib/icons';
import type {
  BankAccountRow,
  CategoryRow,
} from '@/lib/queries/account.queries';
import { getTransactionFormData } from '@/actions/form-data';

// ─── Category Icon Helper ────────────────────────────────────────
// icon field can be a Lucide key (e.g. "Car")

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
  // Fallback: plain text stored directly
  return <span>{icon}</span>;
}

// ─── Type Config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  TransactionType,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  expense: {
    label: 'Expense',
    icon: <TrendingDownIcon className="size-4" />,
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  income: {
    label: 'Income',
    icon: <TrendingUpIcon className="size-4" />,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  transfer: {
    label: 'Transfer',
    icon: <ArrowRightLeftIcon className="size-4" />,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
};

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'other', label: 'Other' },
] as const;

// ─── Account Select Helper ────────────────────────────────────────

function AccountSelect({
  accounts,
  value,
  onValueChange,
  placeholder,
  id,
  excludeId,
  excludeTypes,
}: {
  accounts: BankAccountRow[];
  value: string;
  onValueChange: (val: string | null) => void;
  placeholder: string;
  id?: string;
  excludeId?: string;
  excludeTypes?: string[];
}) {
  const filtered = accounts.filter(
    (a) =>
      a.id !== excludeId && (!excludeTypes || !excludeTypes.includes(a.type)),
  );
  // Look up the selected account for display — avoids Base UI falling back to the raw UUID
  const selectedAccount = accounts.find((a) => a.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        {selectedAccount ? (
          <span className="flex flex-1 items-center gap-1.5 truncate">
            {selectedAccount.icon && <span>{selectedAccount.icon}</span>}
            <span className="truncate">{selectedAccount.name}</span>
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value="">
          <span className="text-muted-foreground">None</span>
        </SelectItem>
        <SelectSeparator />
        {filtered.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            No accounts found
          </SelectItem>
        ) : (
          filtered.map((account) => (
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
  );
}

// ─── Manual Transaction Form ──────────────────────────────────────

interface ManualTransactionFormProps {
  onSuccess: () => void;
  accounts: BankAccountRow[];
  categories: CategoryRow[];
}

function ManualTransactionForm({
  onSuccess,
  accounts,
  categories,
}: ManualTransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<AddTransactionSchemaType>({
    resolver: zodResolver(AddTransactionSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      date: new Date(),
      description: '',
      categoryId: '',
      bankAccountId: '',
      paymentMethod: undefined,
      source: '',
      toAccountId: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() is intentionally reactive
  const selectedType = form.watch('type');

  const selectedAccountId = form.watch('bankAccountId');

  const watchedAmount = form.watch('amount');

  // Compute balance warning for non-credit-card accounts on expense/transfer
  const balanceWarning = useMemo(() => {
    if (
      !selectedAccountId ||
      !watchedAmount ||
      watchedAmount <= 0 ||
      selectedType === 'income'
    )
      return null;
    const account = accounts.find((a) => a.id === selectedAccountId);
    if (!account || account.type === 'credit_card') return null;
    const balance = parseFloat(account.balance);
    if (watchedAmount > balance) {
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(balance);
      return `Exceeds available balance in ${account.name} (${formatted})`;
    }
    return null;
  }, [selectedAccountId, watchedAmount, selectedType, accounts]);

  // Prevent "income" into a credit card. If user switches to "income" while a CC is selected, clear it.
  useEffect(() => {
    if (selectedType === 'income' && selectedAccountId) {
      const account = accounts.find((a) => a.id === selectedAccountId);
      if (account?.type === 'credit_card') {
        form.setValue('bankAccountId', undefined);
      }
    }
  }, [selectedType, selectedAccountId, accounts, form]);

  // Filter categories by selected transaction type (transfers show all)
  const filteredCategories =
    selectedType === 'transfer'
      ? categories
      : categories.filter((c) => c.type === selectedType);

  const onSubmit = (data: AddTransactionSchemaType) => {
    startTransition(async () => {
      const result = await createTransaction(data);
      if (result.success) {
        toastManager.add({
          title: 'Transaction added',
          description: result.message,
          type: 'success',
        });
        form.reset();
        onSuccess();
      } else {
        toastManager.add({
          title: 'Failed to add transaction',
          description: result.message,
          type: 'error',
        });
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      {/* ── Transaction Type Toggle ── */}
      <Field>
        <FieldLabel>Transaction Type</FieldLabel>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_CONFIG) as TransactionType[]).map((type) => {
                const cfg = TYPE_CONFIG[type];
                const active = field.value === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      field.onChange(type);
                      // Reset category when type changes
                      form.setValue('categoryId', '');
                    }}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      active
                        ? `${cfg.bg} ${cfg.color} border-current/20`
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </Field>

      {/* ── Amount ── */}
      <Controller
        control={form.control}
        name="amount"
        render={({ field, fieldState }) => (
          <Field className="relative">
            <FieldLabel htmlFor="amount">Amount</FieldLabel>
            <div className="relative w-full">
              {/* ₹ uses text-foreground so it works in all themes */}
              <span className="text-foreground pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-sm font-semibold">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                aria-invalid={fieldState.invalid}
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === '' ? undefined : parseFloat(val));
                }}
              />
            </div>
            {fieldState.invalid && (
              <span className="text-xs text-red-500">
                {fieldState.error?.message}
              </span>
            )}
            {!fieldState.invalid && balanceWarning && (
              <span className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangleIcon className="size-3.5 shrink-0" />
                {balanceWarning}
              </span>
            )}
          </Field>
        )}
      />

      {/* ── Date ── */}
      <Controller
        control={form.control}
        name="date"
        render={({ field, fieldState }) => (
          <Field className="relative">
            <FieldLabel>Date</FieldLabel>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                render={
                  <button
                    id="transaction-date"
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
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverPopup>
            </Popover>
            {fieldState.invalid && (
              <span className="text-xs text-red-500">
                {fieldState.error?.message}
              </span>
            )}
          </Field>
        )}
      />

      {/* ── Account + Category ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Account (from) */}
        <Controller
          control={form.control}
          name="bankAccountId"
          render={({ field }) => (
            <Field>
              <FieldLabel>
                {selectedType === 'transfer' ? 'From Account' : 'Account'}{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <AccountSelect
                id="bank-account"
                accounts={accounts}
                value={field.value ?? ''}
                onValueChange={(val) =>
                  field.onChange(!val || val === '' ? undefined : val)
                }
                placeholder="Select account"
                excludeTypes={
                  selectedType === 'income' ? ['credit_card'] : undefined
                }
              />
            </Field>
          )}
        />

        {/* Category */}
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
                <SelectTrigger id="category" className="w-full">
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

      {/* ── Description ── */}
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field className="relative">
            <FieldLabel htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="description"
              placeholder="e.g. Coffee at Starbucks"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && (
              <span className="text-xs text-red-500">
                {fieldState.error?.message}
              </span>
            )}
          </Field>
        )}
      />

      {/* ── Payment Method + Conditional fields ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Payment Method */}
        <Controller
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Payment Method{' '}
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
                <SelectTrigger id="payment-method" className="w-full">
                  {(() => {
                    const method = PAYMENT_METHODS.find(
                      (m) => m.value === field.value,
                    );
                    return method ? (
                      <span className="flex-1 truncate">{method.label}</span>
                    ) : (
                      <SelectValue placeholder="Select method" />
                    );
                  })()}
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="">
                    <span className="text-muted-foreground">None</span>
                  </SelectItem>
                  <SelectSeparator />
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          )}
        />

        {/* Source — income only */}
        {selectedType === 'income' && (
          <Controller
            control={form.control}
            name="source"
            render={({ field, fieldState }) => (
              <Field className="relative">
                <FieldLabel htmlFor="source">
                  Income Source{' '}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id="source"
                  placeholder="e.g. Freelance"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && (
                  <span className="text-xs text-red-500">
                    {fieldState.error?.message}
                  </span>
                )}
              </Field>
            )}
          />
        )}

        {/* To Account — transfer only */}
        {selectedType === 'transfer' && (
          <Controller
            control={form.control}
            name="toAccountId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>To Account</FieldLabel>
                <AccountSelect
                  id="to-account"
                  accounts={accounts}
                  value={field.value ?? ''}
                  onValueChange={(val) =>
                    field.onChange(!val || val === '' ? undefined : val)
                  }
                  placeholder="Select destination"
                  // Prevent selecting the same account as source
                  excludeId={selectedAccountId ?? undefined}
                />
                {fieldState.invalid && (
                  <span className="text-xs text-red-500">
                    {fieldState.error?.message}
                  </span>
                )}
              </Field>
            )}
          />
        )}
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <DialogClose render={<Button variant="ghost" type="button" />}>
          Cancel
        </DialogClose>
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            'min-w-28 transition-all',
            selectedType === 'expense' &&
              'border-none bg-red-500 text-white hover:bg-red-600',
            selectedType === 'income' &&
              'border-none bg-emerald-500 text-white hover:bg-emerald-600',
            selectedType === 'transfer' &&
              'border-none bg-blue-500 text-white hover:bg-blue-600',
          )}
        >
          {isPending ? (
            <Spinner name="diagswipe">Saving…</Spinner>
          ) : (
            `Add ${TYPE_CONFIG[selectedType].label}`
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── CSV Upload Placeholder ───────────────────────────────────────

function CsvUploadForm() {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {/* Drop zone */}
      <label
        htmlFor="csv-upload"
        className="border-border bg-muted/40 hover:bg-muted/70 group flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors"
      >
        <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full transition-transform group-hover:scale-105">
          <FileSpreadsheetIcon className="text-primary size-7" />
        </div>
        <div>
          <p className="text-foreground text-sm font-medium">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            CSV, XLS, or XLSX — max 5 MB
          </p>
        </div>
        <input
          id="csv-upload"
          type="file"
          accept=".csv,.xls,.xlsx"
          className="sr-only"
          disabled
        />
      </label>

      {/* Coming-soon notice */}
      <div className="relative flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
          <Clock className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-emerald-400">
            Under Development
          </h4>
          <p className="text-muted-foreground mx-auto max-w-[300px] text-xs">
            Bulk import via CSV or Excel is under development. You&apos;ll be
            able to map columns, preview rows, and import hundreds of
            transactions at once.
          </p>
        </div>
      </div>

      <Button variant="outline" className="w-full" disabled>
        <UploadIcon className="size-4" />
        Import File
      </Button>
    </div>
  );
}

// ─── Main Dialog ─────────────────────────────────────────────────

type DialogTab = 'manual' | 'csv';

interface AddTransactionDialogProps {
  /** Pre-fetched accounts (from a server component). If omitted, fetched lazily on open. */
  accounts?: BankAccountRow[];
  /** Pre-fetched categories (from a server component). If omitted, fetched lazily on open. */
  categories?: CategoryRow[];
  /** Render the dialog with a built-in trigger button */
  withTrigger?: boolean;
  /** Custom trigger element — only used when withTrigger=true */
  trigger?: React.ReactNode;
}

export function AddTransactionDialog({
  accounts: propAccounts,
  categories: propCategories,
  withTrigger = true,
  trigger,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DialogTab>('manual');

  // Lazy-load form data when accounts/categories aren't pre-supplied
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
    if (open && !dataLoaded) {
      getTransactionFormData().then(({ accounts: a, categories: c }) => {
        setAccounts(a);
        setCategories(c);
        setDataLoaded(true);
      });
    }
  }, [open, dataLoaded]);

  const dialogContent = (
    <DialogPopup showCloseButton>
      <DialogHeader>
        <DialogTitle>New Transaction</DialogTitle>
        <DialogDescription>
          Record a transaction manually or import from a file.
        </DialogDescription>

        {/* ── Tab Switcher ── */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DialogTab)}
          className="mt-1"
        >
          <TabsList variant="default" className="w-full">
            <TabsTab value="manual" className="flex-1 gap-2">
              <PlusIcon className="size-3.5" />
              Manual Entry
            </TabsTab>
            <TabsTab value="csv" className="flex-1 gap-2">
              <UploadIcon className="size-3.5" />
              Import File
            </TabsTab>
          </TabsList>
        </Tabs>
      </DialogHeader>

      <DialogPanel>
        {activeTab === 'manual' ? (
          <ManualTransactionForm
            accounts={accounts}
            categories={categories}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <CsvUploadForm />
        )}
      </DialogPanel>
    </DialogPopup>
  );

  if (withTrigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger ? (
          <DialogTrigger render={trigger as React.ReactElement} />
        ) : (
          <DialogTrigger
            render={
              <Button
                id="add-transaction-btn"
                className="gap-2 text-sm font-semibold tracking-tight"
              />
            }
          >
            <PlusIcon className="size-4" />
            Add Transaction
          </DialogTrigger>
        )}
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {dialogContent}
    </Dialog>
  );
}
