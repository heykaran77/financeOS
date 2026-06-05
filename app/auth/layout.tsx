import Logo from '@/components/common/logo';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/common/theme-toggle';
import Image from 'next/image';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Auth layout session error:', error);
  }

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center gap-2 md:justify-between">
          <Link
            href="/"
            className="font-advercase-regular flex items-center gap-2 font-medium"
          >
            <Logo className="text-primary size-6 dark:text-emerald-400" />
            <h1 className="text-xl">FinanceOS</h1>
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="bg-muted pointer-events-none relative hidden lg:block">
        <Image
          src="/assets/auth-image.webp"
          alt="Image"
          fill
          className="absolute inset-0 object-cover object-top-right dark:grayscale"
          priority
        />
        <Logo className="absolute top-24 left-1/2 size-12 -translate-x-1/2 text-white dark:text-emerald-400" />
      </div>
    </div>
  );
}
