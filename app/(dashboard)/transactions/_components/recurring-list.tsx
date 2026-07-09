import { getRecurringTransactions } from '@/lib/queries/recurring.queries';
import { RecurringTable } from './recurring-table';

export async function RecurringList({ userId }: { userId: string }) {
  const transactions = await getRecurringTransactions(userId);

  return <RecurringTable transactions={transactions} />;
}
