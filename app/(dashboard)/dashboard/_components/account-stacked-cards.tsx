import { getBankAccounts } from '@/lib/queries/account.queries';
import { AccountCardStack } from './account-card-stack';

export async function AccountStackedCards({ userId }: { userId: string }) {
  const accounts = await getBankAccounts(userId);

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

  return <AccountCardStack accounts={accounts} />;
}
