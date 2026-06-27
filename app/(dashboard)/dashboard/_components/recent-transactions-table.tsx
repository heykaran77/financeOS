'use client';

import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberFlowCurrency } from '@/components/common/number-flow-currency';
import type { TransactionWithRelations } from '@/lib/queries/transaction.queries';

// ─── Config ─────────────────────────────────────────────────────

const TYPE_CONFIG = {
  income: {
    icon: ArrowDownRight,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/8 dark:bg-emerald-500/12',
    amountColor: 'text-emerald-600 dark:text-emerald-400',
    prefix: '+',
  },
  expense: {
    icon: ArrowUpRight,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/8 dark:bg-red-500/12',
    amountColor: 'text-red-600 dark:text-red-400',
    prefix: '−',
  },
  transfer: {
    icon: ArrowRightLeft,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/8 dark:bg-blue-500/12',
    amountColor: 'text-foreground',
    prefix: '',
  },
} as const;

type TransactionType = keyof typeof TYPE_CONFIG;

// ─── Helpers ────────────────────────────────────────────────────

function getRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Transaction Row ────────────────────────────────────────────

function TransactionRow({ tx }: { tx: TransactionWithRelations }) {
  const config = TYPE_CONFIG[tx.type as TransactionType] || TYPE_CONFIG.expense;
  const Icon = config.icon;
  const amount = parseFloat(tx.amount as string);

  return (
    <div className="group hover:bg-muted/60 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150">
      {/* Type Icon */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          config.bgColor,
        )}
      >
        <Icon className={cn('size-3.5', config.iconColor)} />
      </div>

      {/* Description + Date */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm leading-tight font-medium">
          {tx.description || tx.category?.name || 'Transaction'}
        </span>
        <span className="text-muted-foreground text-xs leading-tight">
          {getRelativeDate(tx.date)}
          {tx.category && (
            <>
              <span className="mx-1 opacity-40">·</span>
              {tx.category.name}
            </>
          )}
        </span>
      </div>

      {/* Amount */}
      <div
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          config.amountColor,
        )}
      >
        {config.prefix}
        <NumberFlowCurrency value={amount} />
      </div>
    </div>
  );
}

// ─── List Component ─────────────────────────────────────────────

export function RecentTransactionsList({
  data,
}: {
  data: TransactionWithRelations[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {data.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}
