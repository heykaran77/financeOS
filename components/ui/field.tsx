'use client';

import { Field as FieldPrimitive } from '@base-ui/react/field';
import type React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Fieldset as FieldSet } from './fieldset';

export function Field({
  className,
  ...props
}: FieldPrimitive.Root.Props): React.ReactElement {
  return (
    <FieldPrimitive.Root
      className={cn('flex flex-col items-start gap-2', className)}
      data-slot="field"
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: FieldPrimitive.Label.Props): React.ReactElement {
  return (
    <FieldPrimitive.Label
      className={cn(
        'text-foreground inline-flex items-center gap-2 text-base/4.5 font-medium data-disabled:opacity-64 sm:text-sm/4',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

export function FieldItem({
  className,
  ...props
}: FieldPrimitive.Item.Props): React.ReactElement {
  return (
    <FieldPrimitive.Item
      className={cn('flex', className)}
      data-slot="field-item"
      {...props}
    />
  );
}

export function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props): React.ReactElement {
  return (
    <FieldPrimitive.Description
      className={cn('text-muted-foreground text-xs', className)}
      data-slot="field-description"
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: FieldPrimitive.Error.Props): React.ReactElement {
  return (
    <FieldPrimitive.Error
      className={cn('text-destructive-foreground text-xs', className)}
      data-slot="field-error"
      {...props}
    />
  );
}

export const FieldControl: typeof FieldPrimitive.Control =
  FieldPrimitive.Control;
export const FieldValidity: typeof FieldPrimitive.Validity =
  FieldPrimitive.Validity;

export function FieldGroup({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      data-slot="field-group"
      {...props}
    />
  );
}

export function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      data-slot="field-separator"
      {...props}
    >
      <Separator className="absolute w-full" />
      {children && (
        <div
          className="text-muted-foreground bg-background relative px-2 text-xs font-medium"
          data-slot="field-separator-content"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export { FieldPrimitive, FieldSet };
