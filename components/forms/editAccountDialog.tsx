'use client';

import { useTransition, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';

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
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toastManager } from '@/components/ui/toast';
import { CATEGORY_ICONS } from '@/lib/icons';

import {
  AddAccountSchema,
  type AddAccountSchemaType,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ICONS,
  type AccountType,
} from '@/types/accountSchema';
import { updateAccount } from '@/actions/account';
import type { BankAccountRow } from '@/lib/queries/account.queries';

// ─── Account Type Items ──────────────────────────────────────────

const accountTypeItems = (
  Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]
).map(([value, label]) => ({
  value,
  label,
  icon: ACCOUNT_TYPE_ICONS[value],
}));

// ─── Preset Colors ───────────────────────────────────────────────

const PRESET_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

// ─── Dialog Component ────────────────────────────────────────────

interface EditAccountDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
  account?: BankAccountRow;
}

export function EditAccountDialog({
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
  account,
}: EditAccountDialogProps) {
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

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<AddAccountSchemaType>({
      resolver: zodResolver(AddAccountSchema),
      defaultValues: {
        name: account?.name || '',
        type: (account?.type as AccountType) || 'savings',
        balance: account ? Number(account.balance) : 0,
        currency: account?.currency || 'INR',
        color: account?.color || '#10b981',
        icon: account?.icon || '',
      },
    });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() is intentionally reactive
  const selectedColor = watch('color');

  const onSubmit = handleSubmit((data: AddAccountSchemaType) => {
    setServerError(null);

    startTransition(async () => {
      if (!account) return;
      const result = await updateAccount(account.id, data);
      if (result.success) {
        toastManager.add({
          title: 'Account updated',
          description: result.message,
          type: 'success',
        });
        handleOpenChange(false);
        reset();
      } else {
        setServerError(result.message);
      }
    });
  });

  const dialogContent = (
    <DialogPopup className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogDescription>Update your bank account details.</DialogDescription>
      </DialogHeader>
      <Form className="contents" onSubmit={onSubmit}>
        <DialogPanel className="grid gap-4">
          {/* Account Name */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Account Name</FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. HDFC Savings, Cash Wallet"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Account Type */}
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Account Type</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || 'savings')}
                >
                  <SelectTrigger className="w-full">
                    {(() => {
                      const item = accountTypeItems.find(
                        (i) => i.value === field.value,
                      );
                      return item ? (
                        <span className="flex flex-1 items-center gap-1.5 truncate">
                          {(() => {
                            const Icon = CATEGORY_ICONS[item.icon as string];
                            return Icon ? (
                              <Icon className="size-4 shrink-0" />
                            ) : (
                              <span className="size-4 shrink-0" />
                            );
                          })()}
                          <span className="truncate">{item.label}</span>
                        </span>
                      ) : (
                        <SelectValue placeholder="Select account type" />
                      );
                    })()}
                  </SelectTrigger>
                  <SelectPopup>
                    {accountTypeItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        <span className="flex items-center gap-2">
                          {(() => {
                            const Icon = CATEGORY_ICONS[item.icon as string];
                            return Icon ? (
                              <Icon className="size-4 shrink-0" />
                            ) : (
                              <span className="size-4 shrink-0" />
                            );
                          })()}
                          {item.label}
                        </span>
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

          {/* Initial Balance */}
          <Controller
            control={control}
            name="balance"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Initial Balance</FieldLabel>
                <InputGroup className="px-2">
                  <InputGroupText>₹</InputGroupText>
                  <InputGroupInput
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === '' ? 0 : parseFloat(val));
                    }}
                  />
                </InputGroup>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Color Picker */}
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Color{' '}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className="relative size-7 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          selectedColor === color
                            ? 'var(--foreground)'
                            : 'transparent',
                      }}
                    >
                      {selectedColor === color && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                  {/* Custom color input */}
                  <label className="bg-muted hover:bg-accent relative flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors">
                    <input
                      type="color"
                      value={field.value || '#10b981'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <span className="text-muted-foreground text-xs">+</span>
                  </label>
                </div>
              </Field>
            )}
          />

          {serverError && <FieldError>{serverError}</FieldError>}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button type="submit" loading={isPending}>
            Save Changes
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
                id="add-account-btn"
                className="gap-2 text-sm font-semibold tracking-tight md:text-base"
              />
            }
          >
            <span className="size-4 shrink-0" />
            Edit Account
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
