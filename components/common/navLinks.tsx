'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';

type NavItems = {
  label: string;
  href: string;
};

export default function NavLinks({
  navItems,
  classname,
}: {
  navItems: NavItems[];
  classname: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={`flex items-center ${classname}`}>
      {navItems.map((item, idx) => (
        <Link
          key={item.label}
          href={item.href}
          className="relative px-3 py-1"
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="text-md relative z-10 font-medium tracking-tight text-neutral-200">
            {item.label}
          </span>
          {hovered === idx && (
            <motion.div
              layoutId="navbar-hover"
              className="absolute inset-0 z-0 h-full w-full rounded-lg bg-emerald-700/40 ring ring-emerald-800/30 dark:ring-emerald-800/30"
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
