'use client';

import { CalendarClock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberFlowCurrency } from '@/components/common/number-flow-currency';

export type UpcomingPaymentRow = {
  id: string;
  description: string | null;
  amount: number;
  nextDueDate: Date;
};

const formatDate = (date: Date) => {
  const today = new Date();
  const target = new Date(date);

  // Check if tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (target.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(target);
};

function getDaysRemaining(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function PaymentRow({ payment }: { payment: UpcomingPaymentRow }) {
  const daysLeft = getDaysRemaining(payment.nextDueDate);
  const isUrgent = daysLeft <= 1;

  return (
    <div className="group hover:bg-muted/60 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150">
      {/* Icon representing Upcoming Bill */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          isUrgent
            ? 'bg-red-500/8 dark:bg-red-500/12'
            : 'bg-neutral-500/8 dark:bg-neutral-500/12',
        )}
      >
        <CalendarClock
          className={cn(
            'size-3.5',
            isUrgent
              ? 'text-red-600 dark:text-red-400'
              : 'text-neutral-600 dark:text-neutral-400',
          )}
        />
      </div>

      {/* Bill Description + Due Date info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm leading-tight font-medium">
          {payment.description || 'Subscription'}
        </span>
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs leading-tight">
          <span>Due {formatDate(payment.nextDueDate)}</span>
          {isUrgent && (
            <>
              <span className="mx-0.5 opacity-40">·</span>
              <span className="flex items-center gap-0.5 font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="size-3" />
                Action required
              </span>
            </>
          )}
        </span>
      </div>

      {/* Amount */}
      <div className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
        <NumberFlowCurrency value={payment.amount} />
      </div>
    </div>
  );
}

export function UpcomingPaymentsTable({
  data,
}: {
  data: UpcomingPaymentRow[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CalendarClock className="text-muted-foreground/60 mb-2 size-8 stroke-[1.5]" />
        <p className="text-muted-foreground text-sm font-medium">
          All caught up
        </p>
        <p className="text-muted-foreground/80 mt-0.5 text-xs">
          No upcoming bills due soon
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {data.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} />
      ))}
    </div>
  );
}
