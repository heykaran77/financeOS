import Logo from '@/components/common/logo';
import Link from 'next/link';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/dashboard');
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Link
              href="/"
              className="font-advercase-regular flex items-center gap-2 font-medium"
            >
              <Logo className="text-primary size-6" />
              <h1 className="text-xl">FinanceOS</h1>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
        <div className="bg-muted pointer-events-none relative hidden lg:block">
          <img
            src="/assets/auth-image.webp"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover object-top-right dark:grayscale"
          />

          <div className="absolute top-24 left-1/2 flex -translate-x-1/2 items-center gap-2 text-white">
            <Logo className="size-8 text-white dark:text-emerald-400" />
            <h2 className="font-advercase-regular text-2xl tracking-tight">
              FinanceOS
            </h2>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
