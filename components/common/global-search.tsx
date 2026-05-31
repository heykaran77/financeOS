'use client';

import { useEffect, useRef } from 'react';
import { Search, Command } from 'lucide-react';
import { Kbd, KbdGroup } from '@/components/ui/kbd';

export function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Ctrl+K or Cmd+K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex w-full max-w-[240px] items-center">
      <Search className="text-muted-foreground absolute left-2.5 size-3.5" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        className="placeholder:text-muted-foreground flex h-8 w-full rounded-full border border-transparent bg-neutral-200/50 py-1 pr-12 pl-8 text-xs transition-all hover:bg-neutral-200/80 focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80"
      />
      <div className="pointer-events-none absolute right-1.5 flex items-center">
        <KbdGroup>
          <Kbd className="h-5 border-none bg-transparent px-1.5 text-[10px] shadow-none">
            <Command className="size-3" /> K
          </Kbd>
        </KbdGroup>
      </div>
    </div>
  );
}
