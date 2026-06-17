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
import { Textarea } from '@/components/ui/textarea';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { createGoal } from '@/actions/goal';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { Popover, PopoverPopup, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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

interface CreateGoalDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
}

export function CreateGoalDialog({
  open,
  onOpenChange,
  withTrigger = false,
  trigger,
}: CreateGoalDialogProps) {
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
      description: '',
      targetAmount: '',
      targetDate: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);

    const formData = new FormData();
    formData.set('name', data.name);
    if (data.description) formData.set('description', data.description);
    formData.set('targetAmount', data.targetAmount);
    if (data.targetDate) formData.set('targetDate', data.targetDate);

    startTransition(async () => {
      const result = await createGoal(formData);
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
        <DialogTitle>Create Goal</DialogTitle>
        <DialogDescription>
          Set a new financial objective, like an emergency fund or saving for a
          vacation.
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
                <Input {...field} type="text" placeholder="e.g. New Car" />
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
                <Textarea
                  {...field}
                  placeholder="What is this goal for?"
                  rows={2}
                />
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
                    placeholder="100,000"
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
              <Field className="relative">
                <FieldLabel>Target Date (optional)</FieldLabel>
                <Popover>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        aria-invalid={fieldState.invalid}
                        className="border-input bg-background text-foreground hover:bg-accent data-[state=open]:border-ring data-[state=open]:ring-ring/24 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm shadow-xs/5 transition-colors data-[state=open]:ring-[3px]"
                      />
                    }
                  >
                    <span
                      className={!field.value ? 'text-muted-foreground' : ''}
                    >
                      {field.value
                        ? format(new Date(field.value), 'PPP')
                        : 'Pick a date'}
                    </span>
                    <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
                  </PopoverTrigger>
                  <PopoverPopup align="start" side="bottom" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
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

          {serverError && <FieldError>{serverError}</FieldError>}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button type="submit" loading={isPending}>
            Create Goal
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
            Create Goal
          </DialogTrigger>
        ) : (
          <DialogTrigger
            render={
              <Button className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700" />
            }
          >
            <Plus className="mr-1 -ml-1 size-5" />
            Create Goal
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
