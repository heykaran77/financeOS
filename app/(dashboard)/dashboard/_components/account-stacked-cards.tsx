import { getBankAccounts } from '@/lib/queries/account.queries';
import { getAuthenticatedUser } from '@/lib/auth.server';
import {
  Component as MorphingCardStack,
  type CardData,
} from '@/components/ui/morphing-card-stack';
import { Wallet } from 'lucide-react';

import { AnimatedNumber as NumberFlow } from '@/components/ui/animated-number';

export async function AccountStackedCards() {
  const user = await getAuthenticatedUser();
  const accounts = await getBankAccounts(user.id);

  const hasCash = accounts.some(
    (a) => a.name.toLowerCase() === 'cash' || a.type.toLowerCase() === 'cash',
  );

  if (!hasCash) {
    accounts.push({
      id: 'default-cash',
      name: 'Cash',
      type: 'cash',
      balance: '0',
      currency: 'INR',
      color: '#10b981',
      icon: null,
      isArchived: false,
    });
  }

  if (accounts.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full min-h-[160px] items-center justify-center rounded-xl border border-dashed text-sm">
        No accounts found
      </div>
    );
  }

  const cardData: CardData[] = accounts.map((account) => ({
    id: account.id,
    title: `Total balance (${account.name})`,
    description: (
      <NumberFlow
        value={Number(account.balance)}
        locales="en-IN"
        format={{
          style: 'currency',
          currency: account.currency || 'INR',
          maximumFractionDigits: 0,
        }}
      />
    ),
    color: account.color || undefined,
    icon: <Wallet className="h-5 w-5" />,
  }));

  return (
    <MorphingCardStack
      cards={cardData}
      defaultLayout="stack"
      className="h-full w-full"
    />
  );
}
