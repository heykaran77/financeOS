import NavLinks from '@/components/common/navLinks';
import { NavbarConfig } from '@/config/navbarConfig';
import { CommandIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-15 mx-auto flex w-full max-w-2xl items-center justify-between rounded-lg bg-neutral-400/30 px-4 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <CommandIcon className="size-6" />
        <p className="text-md font-advercase-regular">FinanceOS</p>
      </div>
      <NavLinks navItems={NavbarConfig.navbarLinks} />
    </nav>
  );
}
