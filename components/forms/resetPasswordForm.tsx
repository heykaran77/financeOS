'use client';

import { cn } from '@/lib/utils';
import {
  ResetPasswordSchema,
  ResetPasswordSchemaType,
} from '@/types/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Spinner from '../common/unicodeSpinner';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '../ui/toast';
import { useRouter, useSearchParams } from 'next/navigation';

interface ResetPasswordProps {
  className?: string;
}

export default function ResetPasswordForm({
  className,
  ...props
}: ResetPasswordProps) {
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
  });
  const [resetPending, startReset] = useTransition();

  const onSubmit = (data: ResetPasswordSchemaType) => {
    startReset(async () => {
      try {
        const response = await authClient.resetPassword({
          newPassword: data.password,
          token: params.get('token') || '',
        });
        if (response.error) {
          toastManager.add({
            title: 'Error reseting password',
            description: response.error.message,
            type: 'error',
          });
          return;
        }
        toastManager.add({
          title: 'Password reset successfully',
          description: 'You can now login with your new password',
          type: 'success',
        });
        router.push('/auth/login');
      } catch {
        toastManager.add({
          title: 'Error reseting password',
          description: 'Something went wrong. Please try again later.',
          type: 'error',
        });
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
      className={cn('flex flex-col gap-6', className)}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-advercase-regular text-center text-2xl tracking-tight">
          Reset Password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your new password to reset password.
        </p>
      </div>
      <FieldGroup>
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => {
            return (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  placeholder="********"
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <span className="text-xs text-red-500">
                    {fieldState.error?.message}
                  </span>
                )}
              </Field>
            );
          }}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => {
            return (
              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  placeholder="********"
                  {...field}
                  id="confirmPassword"
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <span className="text-xs text-red-500">
                    {fieldState.error?.message}
                  </span>
                )}
              </Field>
            );
          }}
        />
        <Field>
          <Button disabled={resetPending} type="submit" className="flex w-full">
            {resetPending ? (
              <Spinner name="diagswipe">Resetting</Spinner>
            ) : (
              'Reset Password'
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
