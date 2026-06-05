'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankAccountRow } from '@/lib/queries/account.queries';
import { CardFrame } from '@/components/ui/card';

export function AccountCardStack({ accounts }: { accounts: BankAccountRow[] }) {
  const [cards, setCards] = useState(accounts);
  const [isHovered, setIsHovered] = useState(false);

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
      className="perspective-1000 relative h-full min-h-[160px] w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((account, index) => {
          const isTop = index === 0;
          return (
            <motion.div
              key={account.id}
              layout
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{
                opacity: 1,
                filter: index > 0 ? 'blur(3px)' : 'blur(0px)',
                y: isHovered ? index * 8 : 0,
                scale: 1 - index * 0.04,
                zIndex: cards.length - index,
              }}
              exit={{
                opacity: 0,
                filter: 'blur(10px)',
                y: 20,
                scale: 0.9,
                transition: { duration: 0.2 },
              }}
              transition={{
                type: 'spring',
                stiffness: 250,
                damping: 25,
                mass: 0.8,
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ transformOrigin: 'top center' }}
              drag={isTop ? true : false}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset }) => {
                // If dragged more than 50px in any direction, swap the card
                if (Math.abs(offset.x) > 50 || Math.abs(offset.y) > 50) {
                  moveToEnd();
                }
              }}
            >
              <CardFrame
                className="bg-card flex h-full flex-col justify-between gap-4 border p-6 shadow-md"
                style={{
                  borderTop: isTop
                    ? `4px solid ${account.color || 'var(--color-emerald-500)'}`
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-advercase-regular text-lg text-emerald-400">
                    {account.name}
                  </h3>
                  <div className="text-muted-foreground/60 font-mono text-xs">
                    {account.type.toUpperCase()}
                  </div>
                </div>

                <div className="mt-2 text-4xl font-bold tracking-tight text-red-500">
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
