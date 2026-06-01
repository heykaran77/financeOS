import { getTransactions } from '@/lib/queries/transaction.queries';
import { TransactionTable } from './transaction-table';

type TransactionListProps = {
  userId: string;
};

/**
 * Async Server Component that fetches transactions and passes them
 * to the client-side TransactionTable.
 * Wrapped in <Suspense> by the parent page.
 */
export async function TransactionList({ userId }: TransactionListProps) {
  const { data, total } = await getTransactions(userId, {
    limit: 50,
  });

  return <TransactionTable data={data} totalCount={total} />;
}
