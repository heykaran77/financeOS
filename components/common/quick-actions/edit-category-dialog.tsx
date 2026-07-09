'use client';

import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2 } from 'lucide-react';
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
import { updateCategory } from '@/actions/category';
import { CATEGORY_ICONS } from '@/lib/icons';

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
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoryDialogProps {
  category: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
}: EditCategoryDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      icon: category.icon || '',
      color: category.color || colorPresets[4],
    },
  });

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    reset({
      id: category.id,
      name: category.name,
      icon: category.icon || '',
      color: category.color || colorPresets[4],
    });
  }, [isOpen, category, reset]);

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

  const onSubmit = handleSubmit((data) => {
    setServerError(null);

    const formData = new FormData();
    formData.set('id', data.id);
    formData.set('name', data.name);
    formData.set('color', data.color);
    if (data.icon) {
      formData.set('icon', data.icon);
    }

    startTransition(async () => {
      const result = await updateCategory(formData);
      if (result.success) {
        handleOpenChange(false);
      } else {
        setServerError(result.message);
      }
    });
  });

  const dialogContent = (
    <DialogPopup className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription>
          Update the name, icon, and color of your category.
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
                <Input {...field} placeholder="e.g. Groceries" />
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
                <FieldLabel>Icon (optional)</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || '')}
                >
                  <SelectTrigger className="w-full">
                    {field.value ? (
                      <span className="flex items-center gap-2">
                        {CATEGORY_ICONS[field.value] ? (
                          (() => {
                            const Icon = CATEGORY_ICONS[field.value];
                            return <Icon className="size-4" />;
                          })()
                        ) : (
                          <span className="text-base leading-none">
                            {field.value}
                          </span>
                        )}
                        <span className="truncate">
                          {CATEGORY_ICONS[field.value] ? field.value : 'Emoji'}
                        </span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Select an icon" />
                    )}
                  </SelectTrigger>
                  <SelectPopup className="max-h-[300px] w-(--anchor-width)">
                    <SelectItem value="">None</SelectItem>
                    {Object.keys(CATEGORY_ICONS).map((iconKey) => {
                      const Icon = CATEGORY_ICONS[iconKey];
                      return (
                        <SelectItem key={iconKey} value={iconKey}>
                          <span className="flex items-center gap-2">
                            <Icon className="size-4" />
                            {iconKey}
                          </span>
                        </SelectItem>
                      );
                    })}
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
            name="color"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Color</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="ring-offset-background focus-visible:ring-ring data-[selected=true]:ring-ring size-8 rounded-full ring-offset-2 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:outline-none data-[selected=true]:ring-2"
                      style={{ backgroundColor: color }}
                      data-selected={field.value === color}
                      onClick={() => field.onChange(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                  <div className="relative overflow-hidden rounded-full border">
                    <input
                      type="color"
                      {...field}
                      className="absolute -top-2 -left-2 size-12 cursor-pointer"
                    />
                  </div>
                </div>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {serverError && (
            <div className="text-destructive text-sm font-medium">
              {serverError}
            </div>
          )}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
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
            render={<Button variant="ghost" size="icon" className="size-8" />}
          >
            <Edit2 className="size-4" />
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
