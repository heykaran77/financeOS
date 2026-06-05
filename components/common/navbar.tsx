import Logout from '@/components/common/logout';
import NavLinks from '@/components/common/navLinks';
import { Button } from '@/components/ui/button';
import { NavbarConfig } from '@/config/navbarConfig';
import { auth } from '@/lib/auth';
import Logo from '@/components/common/logo';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

function AuthButtonsSkeleton() {
  return <Skeleton className="pointer-events-auto h-8 w-[70px] rounded-md" />;
}

async function AuthButtons() {
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Navbar session error:', error);
  }
  const user = session?.user;

  if (!user) {
    return (
      <Button
        className="pointer-events-auto text-sm"
        render={<Link href={'/auth/sign-up'} />}
      >
        <span className="text-neutral-200 dark:text-neutral-800">
          Get Started
        </span>
      </Button>
    );
  }

  return (
    <Logout className="pointer-events-auto text-sm text-neutral-200 dark:text-neutral-800" />
  );
}

export default function Navbar() {
  return (
    <nav className="pointer-events-none fixed top-0 left-1/2 z-50 flex w-full max-w-4xl -translate-x-1/2 items-center justify-between rounded-none bg-neutral-800/20 px-4 py-4 backdrop-blur-sm md:top-4 md:rounded-lg">
      <Link href={'/'} className="pointer-events-auto flex items-center gap-2">
        <Logo className="size-6 text-emerald-400" />
        <p className="text-md font-advercase-regular tracking-tight text-neutral-200">
          FinanceOS
        </p>
      </Link>

      <NavLinks
        navItems={NavbarConfig.navbarLinks}
        classname="pointer-events-auto hidden md:block"
      />
      <Suspense fallback={<AuthButtonsSkeleton />}>
        <AuthButtons />
      </Suspense>
    </nav>
  );
}
