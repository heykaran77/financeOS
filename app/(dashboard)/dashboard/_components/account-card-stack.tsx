'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankAccountRow } from '@/lib/queries/account.queries';
import { AnimatedNumber as NumberFlow } from '@/components/ui/animated-number';
import { FlippableAccountCard } from '@/components/ui/flippable-account-card';

export function AccountCardStack({
  accounts,
  userName,
}: {
  accounts: BankAccountRow[];
  userName: string;
}) {
  const [cards, setCards] = useState(accounts);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Re-sync local state when new accounts data comes in from the server
    setCards(accounts);
  }, [accounts]);

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

  return (
    <div
      className="perspective-1000 relative h-full min-h-[220px] w-full"
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
              <FlippableAccountCard
                className="h-full w-full max-w-none"
                accountName={account.name}
                accountHolderName={userName}
                accountType={account.type}
                currency={account.currency || 'INR'}
                color={account.color || undefined}
                hideGlow
                solidBackground
                balanceElement={
                  <NumberFlow
                    key={isTop ? 'active' : 'inactive'}
                    value={Number(account.balance)}
                    locales="en-IN"
                    format={{
                      style: 'currency',
                      currency: account.currency || 'INR',
                      maximumFractionDigits: 0,
                    }}
                  />
                }
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
