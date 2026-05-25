import Logo from '@/components/common/logo';
import Link from 'next/link';
import { ThemeProvider } from '@/components/providers/theme-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/assets/auth-image.webp"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover object-top-right dark:grayscale"
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
