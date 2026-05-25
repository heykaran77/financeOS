'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, SignUpSchemaType } from '@/types/authSchema';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toastManager } from '@/components/ui/toast';
import Spinner from '@/components/common/unicodeSpinner';
import { authClient } from '@/lib/auth-client';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const router = useRouter();

  const [isSignUpPending, startSignUpTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const onSubmit = (data: SignUpSchemaType) => {
    startSignUpTransition(async () => {
      try {
        const response = await authClient.signUp.email({
          email: data.email,
          password: data.password,
          name: data.name,
        });
        if (response.error) {
          toastManager.add({
            title: 'Sign up failed',
            description: response.error.message,
            type: 'error',
          });
        } else {
          toastManager.add({
            title: 'Sign up successful',
            description: 'Account created! Please check your email to verify.',
            type: 'success',
          });
          router.push('/auth/login');
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const signUpWithGoogle = () => {
    startGoogleTransition(async () => {
      try {
        const data = await authClient.signIn.social({
          provider: 'google',
          callbackURL: '/dashboard',
        });

        if (data.error) {
          toastManager.add({
            title: 'Sign up failed',
            description: data.error.message,
            type: 'error',
          });
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <h1 className="font-advercase-regular text-center text-2xl tracking-tight">
          Create your account
        </h1>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field className="relative">
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <span className="absolute top-full left-0 mt-1 text-xs text-red-500">
                  {fieldState.error?.message}
                </span>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="relative">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <span className="absolute top-full left-0 mt-1 text-xs text-red-500">
                  {fieldState.error?.message}
                </span>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="relative">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <span className="absolute top-full left-0 mt-1 text-xs text-red-500">
                  {fieldState.error?.message}
                </span>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field className="relative">
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <span className="absolute top-full left-0 mt-1 text-xs text-red-500">
                  {fieldState.error?.message}
                </span>
              )}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" className="w-full" disabled={isSignUpPending}>
            {isSignUpPending ? (
              <Spinner name="diagswipe">Creating Account</Spinner>
            ) : (
              'Create Account'
            )}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            disabled={isGooglePending}
            variant="outline"
            type="button"
            className="flex w-full items-center justify-center gap-2"
            onClick={signUpWithGoogle}
          >
            {isGooglePending ? (
              <Spinner name="diagswipe">Creating account</Spinner>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm font-semibold">
                  Continue with Google
                </span>
              </>
            )}
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{' '}
            <Link className="underline underline-offset-4" href="/auth/login">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
