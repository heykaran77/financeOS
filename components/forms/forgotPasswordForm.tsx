'use client';

import {
  ForgotPasswordSchema,
  ForgotPasswordSchemaType,
} from '@/types/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import Spinner from '../common/unicodeSpinner';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '../ui/toast';

interface ForgotPasswordFormProps {
  className?: string;
}

export default function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const [loading, startForgotTransition] = useTransition();

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    startForgotTransition(async () => {
      try {
        const response = await authClient.requestPasswordReset({
          email: data.email,
          redirectTo: '/auth/reset-password',
        });

        if (response.error) {
          toastManager.add({
            title: 'Error sending reset password mail',
            description: response.error.message,
            type: 'error',
          });
          return;
        }

        toastManager.add({
          title: 'Reset password mail sent',
          description: 'Check your email for further instructions',
          type: 'success',
        });

        form.reset();
      } catch {
        toastManager.add({
          title: 'Error sending reset password mail',
          description: 'Something went wrong. Please try again later.',
          type: 'error',
        });
      }
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-advercase-regular text-center text-2xl tracking-tight">
          Forgot Password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your registered email to reset password.
        </p>
      </div>
      <FieldGroup className="-space-y-2">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => {
            return (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  placeholder="heykaran@gmail.com"
                  aria-invalid={fieldState.invalid}
                  {...field}
                  id="email"
                  type="email"
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
          <Button disabled={loading} type="submit" className="flex w-full">
            {loading ? (
              <Spinner name="diagswipe">Sending</Spinner>
            ) : (
              'Send Reset Mail'
            )}
          </Button>
          <FieldDescription className="text-center">
            Remembered your password?{' '}
            <Link className="underline underline-offset-4" href="/auth/login">
              Log in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
