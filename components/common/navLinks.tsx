'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';

type NavItems = {
  label: string;
  href: string;
};

export default function NavLinks({ navItems }: { navItems: NavItems[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center">
      {navItems.map((item, idx) => (
        <Link
          key={item.label}
          href={item.href}
          className="relative px-3 py-1"
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="text-md relative z-10 font-medium tracking-tight">
            {item.label}
          </span>
          {hovered === idx && (
            <motion.div
              layoutId="navbar-hover"
              className="bg-muted absolute inset-0 z-0 h-full w-full rounded-lg ring ring-neutral-400/30 dark:ring-neutral-400/30"
              transition={{
                duration: 0.3,
              }}
            ></motion.div>
          )}
        </Link>
      ))}
    </div>
  );
}
