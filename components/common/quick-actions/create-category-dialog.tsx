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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createCategory } from '@/actions/category';
import { Plus } from 'lucide-react';
import { CATEGORY_ICONS } from '@/lib/icons';

const typeItems = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];

const colorPresets = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['expense', 'income']),
  icon: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCategoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
}: CreateCategoryDialogProps) {
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

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '',
      color: colorPresets[4],
    },
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('type', data.type);
    formData.set('color', data.color);
    if (data.icon) formData.set('icon', data.icon);

    startTransition(async () => {
      const result = await createCategory(formData);
      if (result.success) {
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
        <DialogTitle>Create Category</DialogTitle>
        <DialogDescription>
          Add a new category to organize your transactions and budgets.
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
                <Input {...field} type="text" placeholder="e.g. Groceries" />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select
                  items={typeItems}
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || 'expense')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectPopup>
                    {typeItems.map((item) => (
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

          <Controller
            control={control}
            name="icon"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Icon</FieldLabel>
                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto p-1">
                  {Object.entries(CATEGORY_ICONS).map(
                    ([name, IconComponent]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => field.onChange(name)}
                        className="hover:bg-muted flex size-8 items-center justify-center rounded-md border-2 transition-all"
                        style={{
                          borderColor:
                            field.value === name
                              ? 'var(--color-primary)'
                              : 'transparent',
                          backgroundColor:
                            field.value === name
                              ? 'var(--color-primary-foreground)'
                              : undefined,
                        }}
                        aria-label={`Select icon ${name}`}
                      >
                        <IconComponent className="size-4" />
                      </button>
                    ),
                  )}
                </div>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="color"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Color</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className="size-7 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          field.value === color ? 'white' : 'transparent',
                        boxShadow:
                          field.value === color ? `0 0 0 2px ${color}` : 'none',
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {serverError && <FieldError>{serverError}</FieldError>}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button type="submit" loading={isPending}>
            Create Category
          </Button>
        </DialogFooter>
      </Form>
    </DialogPopup>
  );

  if (withTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {trigger ? (
          <DialogTrigger render={trigger as React.ReactElement}>
            Create Category
          </DialogTrigger>
        ) : (
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            <Plus className="mr-1 -ml-1 size-4" />
            New Category
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
