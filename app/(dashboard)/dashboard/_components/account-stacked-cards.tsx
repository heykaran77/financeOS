import { getBankAccounts } from '@/lib/queries/account.queries';
import { AccountCardStack } from './account-card-stack';
import { getAuthenticatedUser } from '@/lib/auth.server';

export async function AccountStackedCards({ userId }: { userId: string }) {
  const accounts = await getBankAccounts(userId);
  const user = await getAuthenticatedUser();
  const userName = user.name
    ? user.name.split(' ').slice(0, 2).join(' ')
    : 'USER';

  if (accounts.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed text-sm">
        No accounts found
      </div>
    );
  }

  return <AccountCardStack accounts={accounts} userName={userName} />;
}
