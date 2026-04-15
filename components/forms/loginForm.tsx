'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LoginSchema, LoginSchemaType } from '@/types/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '@/actions/user';
import { useRouter } from 'next/navigation';
import { toastManager } from '@/components/ui/toast';
import Spinner from '@/components/common/unicodeSpinner';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoginPending, startLoginTransition] = useTransition();
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const router = useRouter();
  const onSubmit = (data: LoginSchemaType) => {
    startLoginTransition(async () => {
      try {
        const response = await loginUser(data.email, data.password);
        if (response.success) {
          router.push('/dashboard');
          toastManager.add({
            title: 'Login successful',
            description: response.message,
            type: 'success',
          });
          form.reset();
        } else {
          toastManager.add({
            title: 'Login failed',
            description: response.message,
            type: 'error',
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Login to your FinanceOS
                </p>
              </div>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <span className="text-xs text-red-500">
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
                  <Field>
                    <div className="flex w-full items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <span className="text-xs text-red-500">
                        {fieldState.error?.message}
                      </span>
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button
                  disabled={isLoginPending}
                  type="submit"
                  className="w-full"
                >
                  {isLoginPending ? (
                    <Spinner name="diagswipe">Logging in</Spinner>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" className="col-span-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <FieldDescription className="col-span-full text-center">
                  Don&apos;t have an account?{' '}
                  <Link className="text-blue-500" href="/auth/sign-up">
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/login.webp"
              alt="Image"
              fill
              className="absolute inset-0 h-full w-full object-cover object-center dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
