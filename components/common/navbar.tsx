import Logout from '@/components/common/logout';
import NavLinks from '@/components/common/navLinks';
import { Button } from '@/components/ui/button';
import { NavbarConfig } from '@/config/navbarConfig';
import { auth } from '@/lib/auth';
import { CommandIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;
  return (
    <nav className="sticky top-4 z-15 mx-auto flex w-full max-w-2xl items-center justify-between rounded-lg bg-neutral-400/30 px-4 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <CommandIcon className="size-6" />
        <p className="text-md font-advercase-regular">FinanceOS</p>
      </div>
      <NavLinks navItems={NavbarConfig.navbarLinks} />
      {!user && (
        <Button>
          <Link href={'/auth/sign-up'}>Get Started</Link>
        </Button>
      )}
      {user && <Logout />}
    </nav>
  );
}
