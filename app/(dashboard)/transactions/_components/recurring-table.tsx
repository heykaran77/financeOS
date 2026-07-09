'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  TrendingDownIcon,
  TrendingUpIcon,
  RepeatIcon,
  MoreVerticalIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardFrame } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  Menu,
  MenuPopup,
  MenuItem,
  MenuTrigger,
  MenuSeparator,
} from '@/components/ui/menu';
import { NumberFlowCurrency } from '@/components/common/number-flow-currency';
import type { RecurringTransactionRow } from '@/lib/queries/recurring.queries';
import { CATEGORY_ICONS } from '@/lib/icons';
import { useTransition } from 'react';
import {
  toggleRecurringTransaction,
  deleteRecurringTransaction,
} from '@/actions/recurring';
import { toastManager } from '@/components/ui/toast';

// ─── Actions Component ──────────────────────────────────────────

import type { Row } from '@tanstack/react-table';

function RecurringActions({ row }: { row: Row<RecurringTransactionRow> }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleRecurringTransaction(row.original.id);
      if (result.success) {
        toastManager.add({
          title: 'Success',
          description: result.message,
          type: 'success',
        });
      } else {
        toastManager.add({
          title: 'Error',
          description: result.message,
          type: 'error',
        });
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this recurring transaction?'))
      return;

    startTransition(async () => {
      const result = await deleteRecurringTransaction(row.original.id);
      if (result.success) {
        toastManager.add({
          title: 'Deleted',
          description: result.message,
          type: 'success',
        });
      } else {
        toastManager.add({
          title: 'Error',
          description: result.message,
          type: 'error',
        });
      }
    });
  };

  return (
    <Menu>
      <MenuTrigger
        render={<Button variant="ghost" size="icon" disabled={isPending} />}
      >
        <MoreVerticalIcon className="size-4" />
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuItem onClick={handleToggle}>
          {row.original.isActive ? (
            <>
              <PauseIcon className="mr-2 size-4" /> Pause
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 size-4" /> Resume
            </>
          )}
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onClick={handleDelete}
          className="text-destructive focus:bg-destructive/10"
        >
          <TrashIcon className="mr-2 size-4" /> Delete
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

// ─── Columns ────────────────────────────────────────────────────

const columns: ColumnDef<RecurringTransactionRow>[] = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const isIncome = row.original.type === 'income';
      const name = row.getValue('description') as string;
      const lowerName = name.toLowerCase();

      let BrandIcon = null;
      if (lowerName.includes('netflix')) {
        BrandIcon = (
          <svg
            fill="#E50914"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4"
          >
            <title>Netflix</title>
            <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z" />
          </svg>
        );
      } else if (lowerName.includes('amazon') || lowerName.includes('prime')) {
        BrandIcon = (
          <svg
            fill="#00A8E1"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4"
          >
            <title>Amazon Prime</title>
            <path d="M14.654 22.844c-3.141 1.096-7.859 1.488-11.464-.326-1.127-.562-1.789-1.284-1.464-1.897.35-.658 1.455-.386 2.378-.052 3.655 1.326 7.822 1.258 10.984.093.587-.216 1.157-1.158 1.583-.341.332.637.284 1.769-.017 2.523zm.671-3.693c-1.396.904-2.885 1.341-3.642 1.309-.766-.033-.49-1.077-.49-1.077s1.39-1.082 1.79-1.218c.414-.14 1.268.04 1.439-.063.18-.11-.274-1.266-.274-1.266s.847-.194 1.325.267c.504.485.498 1.36.143 1.956.12-.132-2.148-.258-.291.092z" />
          </svg>
        );
      } else if (lowerName.includes('spotify')) {
        BrandIcon = (
          <svg
            fill="#1ED760"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4"
          >
            <title>Spotify</title>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        );
      } else if (lowerName.includes('apple')) {
        BrandIcon = (
          <svg
            fill="currentColor"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4"
          >
            <title>Apple</title>
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
          </svg>
        );
      }

      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full',
              BrandIcon
                ? 'text-foreground bg-transparent'
                : isIncome
                  ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 dark:bg-red-500/20',
            )}
          >
            {BrandIcon ? (
              BrandIcon
            ) : isIncome ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div>
            <div className="text-foreground font-medium">
              {row.getValue('description')}
            </div>
            <div className="text-muted-foreground text-xs capitalize">
              {row.original.frequency}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const isIncome = row.original.type === 'income';
      const amount = parseFloat(row.getValue('amount'));
      return (
        <div
          className={cn(
            'text-right font-mono font-medium',
            isIncome ? 'text-emerald-500' : 'text-foreground',
          )}
        >
          {isIncome ? '+' : '-'}
          <NumberFlowCurrency value={amount} currency="INR" />
        </div>
      );
    },
  },
  {
    accessorKey: 'nextDueDate',
    header: 'Next Due',
    cell: ({ row }) => {
      const date = row.getValue('nextDueDate') as Date;
      return (
        <div className="whitespace-nowrap">{format(date, 'MMM d, yyyy')}</div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
          {isActive ? 'Active' : 'Paused'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <RecurringActions row={row} />
      </div>
    ),
  },
];

// ─── Main Component ─────────────────────────────────────────────

export function RecurringTable({
  transactions,
}: {
  transactions: RecurringTransactionRow[];
}) {
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (transactions.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia>
            <RepeatIcon className="size-8" />
          </EmptyMedia>
          <EmptyTitle>No recurring transactions</EmptyTitle>
          <EmptyDescription>
            Set up subscriptions or recurring bills to track them automatically.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <CardFrame>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(!row.original.isActive && 'opacity-60 grayscale')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardFrame>
  );
}
