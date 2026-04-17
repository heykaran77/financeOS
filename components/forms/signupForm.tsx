'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, SignUpSchemaType } from '@/types/authSchema';
import { useTransition } from 'react';
import { signUpUser } from '@/actions/user';
import { useRouter } from 'next/navigation';
import { toastManager } from '@/components/ui/toast';
import Spinner from '@/components/common/unicodeSpinner';
import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
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
        const response = await signUpUser(data.name, data.email, data.password);
        if (response.success) {
          toastManager.add({
            title: 'Sign up successful',
            description: response.message,
            type: 'success',
          });
          router.push('/auth/login');
        } else {
          toastManager.add({
            title: 'Sign up failed',
            description: response.message,
            type: 'error',
          });
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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <h1 className="text-2xl font-bold">Create your account</h1>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Murphy"
                      {...field}
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
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...field}
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
                <Field className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          placeholder="*******"
                          {...field}
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
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <span className="text-xs text-red-500">
                            {fieldState.error?.message}
                          </span>
                        )}
                      </Field>
                    )}
                  />
                </Field>
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSignUpPending}
                >
                  {isSignUpPending ? (
                    <Spinner name="diagswipe">Creating Account</Spinner>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-3 gap-4">
                <Button
                  disabled={isGooglePending}
                  variant="outline"
                  type="button"
                  className="col-span-3 flex items-center gap-2"
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
                <FieldDescription className="col-span-3 text-center">
                  Already have an account?{' '}
                  <Link className="text-blue-500" href="/auth/login">
                    Login
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
