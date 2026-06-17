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
  DialogTrigger,
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
import { createBudget, getBudgetCategoriesAction } from '@/actions/budget';
import type { CategoryItem } from '@/lib/queries/budget.queries';
import { Plus } from 'lucide-react';
import { CATEGORY_ICONS } from '@/lib/icons';

const periodItems = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' },
];

const formSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
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

interface CreateBudgetDialogProps {
  /** Pre-fetched categories. If omitted, fetched lazily on open. */
  categories?: CategoryItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** If true, renders with its own trigger button */
  withTrigger?: boolean;
  /** Custom trigger element */
  trigger?: React.ReactNode;
}

export function CreateBudgetDialog({
  categories: propCategories,
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
}: CreateBudgetDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const [categories, setCategories] = useState<CategoryItem[]>(
    propCategories ?? [],
  );
  const [dataLoaded, setDataLoaded] = useState(propCategories !== undefined);

  useEffect(() => {
    if (isOpen && !dataLoaded) {
      getBudgetCategoriesAction()
        .then((c) => {
          setCategories(c);
          setDataLoaded(true);
        })
        .catch(console.error);
    }
  }, [isOpen, dataLoaded]);

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
      categoryId: '',
      amount: '',
      period: 'monthly',
    },
  });

  const categoryItems = categories.map((c) => ({
    label: c.name,
    value: c.id,
    icon: c.icon,
    color: c.color,
  }));

  const onSubmit = handleSubmit((data) => {
    setServerError(null);

    const formData = new FormData();
    formData.set('categoryId', data.categoryId);
    formData.set('amount', data.amount.toString());
    formData.set('period', data.period);

    startTransition(async () => {
      const result = await createBudget(formData);
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
        <DialogTitle>Create Budget</DialogTitle>
        <DialogDescription>
          Set a spending limit for a category to track your expenses.
        </DialogDescription>
      </DialogHeader>
      <Form className="contents" onSubmit={onSubmit}>
        <DialogPanel className="grid gap-4">
          <Controller
            control={control}
            name="categoryId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || '')}
                >
                  <SelectTrigger className="w-full">
                    {(() => {
                      const cat = categoryItems.find(
                        (c) => c.value === field.value,
                      );
                      return cat ? (
                        <span className="flex flex-1 items-center gap-1.5 truncate">
                          {cat.icon && CATEGORY_ICONS[cat.icon] ? (
                            (() => {
                              const Icon = CATEGORY_ICONS[cat.icon];
                              return (
                                <Icon
                                  className="size-4"
                                  style={{ color: cat.color ?? 'inherit' }}
                                />
                              );
                            })()
                          ) : (
                            <span className="text-base leading-none">
                              {cat.icon}
                            </span>
                          )}
                          <span className="truncate">{cat.label}</span>
                        </span>
                      ) : (
                        <SelectValue placeholder="Select a category" />
                      );
                    })()}
                  </SelectTrigger>
                  <SelectPopup>
                    {categoryItems.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        No categories found
                      </SelectItem>
                    ) : (
                      categoryItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <span className="flex items-center gap-2">
                            {item.color && (
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            )}
                            {item.icon && CATEGORY_ICONS[item.icon] ? (
                              (() => {
                                const Icon = CATEGORY_ICONS[item.icon];
                                return (
                                  <Icon
                                    className="size-4"
                                    style={{ color: item.color ?? 'inherit' }}
                                  />
                                );
                              })()
                            ) : (
                              <span className="text-base leading-none">
                                {item.icon}
                              </span>
                            )}
                            {item.label}
                          </span>
                        </SelectItem>
                      ))
                    )}
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
                <FieldLabel>Budget Amount</FieldLabel>
                <InputGroup className="px-2">
                  <InputGroupText>₹</InputGroupText>
                  <InputGroupInput
                    {...field}
                    type="number"
                    placeholder="10,000"
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
                  onValueChange={(val) => field.onChange(val || 'monthly')}
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
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button type="submit" loading={isPending}>
            Create Budget
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
            Create Budget
          </DialogTrigger>
        ) : (
          <DialogTrigger
            render={
              <Button className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700" />
            }
          >
            <Plus className="mr-1 -ml-1 size-5" />
            Create Budget
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
