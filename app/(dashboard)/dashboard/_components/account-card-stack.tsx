'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankAccountRow } from '@/lib/queries/account.queries';
import { CardFrame } from '@/components/ui/card';

export function AccountCardStack({ accounts }: { accounts: BankAccountRow[] }) {
  const [cards, setCards] = useState(accounts);

  const moveToEnd = () => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const topCard = newCards.shift();
      if (topCard) {
        newCards.push(topCard);
      }
      return newCards;
    });
  };

  const formatCurrency = (val: string | number, currency: string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val));

  return (
    <div
      className="perspective-1000 relative h-full min-h-[160px] w-full cursor-pointer"
      onClick={moveToEnd}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((account, index) => {
          const isTop = index === 0;
          return (
            <motion.div
              key={account.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{
                opacity: 1 - index * 0.2,
                y: index * 12,
                scale: 1 - index * 0.05,
                zIndex: cards.length - index,
              }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-0"
              style={{ transformOrigin: 'top center' }}
            >
              <CardFrame
                className={`flex h-full flex-col justify-between gap-4 border p-6 shadow-md transition-colors ${
                  isTop ? 'bg-card' : 'bg-muted/80'
                }`}
                style={{
                  borderTop: isTop
                    ? `4px solid ${account.color || 'var(--color-emerald-500)'}`
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Total balance ({account.name})
                  </h3>
                  <div className="text-muted-foreground/60 font-mono text-xs">
                    {account.type.toUpperCase()}
                  </div>
                </div>

                <div className="text-foreground mt-2 text-4xl font-bold tracking-tight">
                  {formatCurrency(account.balance, account.currency)}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-sm">
                    **** **** **** {account.id.substring(0, 4)}
                  </span>
                </div>
              </CardFrame>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
