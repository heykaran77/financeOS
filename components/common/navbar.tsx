import Logout from '@/components/common/logout';
import NavLinks from '@/components/common/navLinks';
import { Button } from '@/components/ui/button';
import { NavbarConfig } from '@/config/navbarConfig';
import { auth } from '@/lib/auth';
import Logo from '@/components/common/logo';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;
  return (
    <nav className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center justify-between rounded-lg bg-neutral-800/20 px-4 py-4 backdrop-blur-sm">
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
      {!user && (
        <Button
          className="pointer-events-auto"
          render={<Link href={'/auth/sign-up'} />}
        >
          <span className="md:text-normal text-sm text-neutral-200">
            Get Started
          </span>
        </Button>
      )}
      {user && <Logout className="pointer-events-auto text-neutral-200" />}
    </nav>
  );
}
