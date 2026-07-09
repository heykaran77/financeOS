import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import {
  getBankAccounts,
  getTotalBalance,
} from '@/lib/queries/account.queries';
import SectionHeading from '@/components/common/SectionHeading';
import { AddAccountDialog } from '@/components/forms/addAccountDialog';
import { TotalBalanceSummary } from './_components/total-balance-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { CardFrame } from '@/components/ui/card';
import { AccountGrid } from './_components/account-grid';

export const metadata = { title: 'Accounts | Finance OS' };

const AccountGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <CardFrame key={i} className="flex h-[160px] flex-col gap-4 p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-10 w-48" />
        <Skeleton className="mt-1 h-4 w-24" />
      </CardFrame>
    ))}
  </div>
);

export default async function AccountsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <SectionHeading
          heading="Accounts"
          subHeading="Manage your bank accounts, wallets, and cards."
        />
        <AddAccountDialog withTrigger />
      </div>

      <Suspense
        fallback={
          <>
            <CardFrame className="flex h-[100px] items-center gap-4 p-6">
              <Skeleton className="h-10 w-48" />
            </CardFrame>
            <AccountGridSkeleton />
          </>
        }
      >
        <AccountContent userId={user.id} />
      </Suspense>
    </div>
  );
}

async function AccountContent({ userId }: { userId: string }) {
  const [accounts, totalBalance, user] = await Promise.all([
    getBankAccounts(userId),
    getTotalBalance(userId),
    getAuthenticatedUser(),
  ]);

  const userName = user.name
    ? user.name.split(' ').slice(0, 2).join(' ')
    : 'USER';

  // Filter out the synthetic "default-cash" placeholder
  const realAccounts = accounts.filter((a) => a.id !== 'default-cash');

  return (
    <>
      <TotalBalanceSummary totalBalance={totalBalance} />
      <AccountGrid accounts={realAccounts} userName={userName} />
    </>
  );
}
