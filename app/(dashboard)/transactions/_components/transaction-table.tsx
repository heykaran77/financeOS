'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  ReceiptText,
  Plus,
  CreditCard,
  Banknote,
  Smartphone,
  Globe,
  CircleEllipsis,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardFrame, CardFrameFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { NumberFlowCurrency } from '@/components/common/number-flow-currency';
import type { TransactionWithRelations } from '@/lib/queries/transaction.queries';

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

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
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

const TYPE_CONFIG = {
  income: {
    label: 'Income',
    icon: ArrowDownRight,
    dotColor: 'bg-emerald-500',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/8 dark:bg-emerald-500/12',
    badgeVariant: 'success' as const,
  },
  expense: {
    label: 'Expense',
    icon: ArrowUpRight,
    dotColor: 'bg-red-500',
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/8 dark:bg-red-500/12',
    badgeVariant: 'error' as const,
  },
  transfer: {
    label: 'Transfer',
    icon: ArrowRightLeft,
    dotColor: 'bg-blue-500',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/8 dark:bg-blue-500/12',
    badgeVariant: 'info' as const,
  },
} as const;

type TransactionType = keyof typeof TYPE_CONFIG;

const PAYMENT_METHOD_CONFIG: Record<
  string,
  { label: string; icon: typeof CreditCard }
> = {
  cash: { label: 'Cash', icon: Banknote },
  upi: { label: 'UPI', icon: Smartphone },
  card: { label: 'Card', icon: CreditCard },
  net_banking: { label: 'Net Banking', icon: Globe },
  other: { label: 'Other', icon: CircleEllipsis },
};

function getPaymentMethodConfig(method: string | null) {
  if (!method) return null;
  return PAYMENT_METHOD_CONFIG[method] || null;
}

// ─── Columns ────────────────────────────────────────────────────

const columns: ColumnDef<TransactionWithRelations>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected();
      const isSomeSelected = table.getIsSomePageRowsSelected();
      return (
        <Checkbox
          aria-label="Select all rows"
          checked={isAllSelected}
          indeterminate={isSomeSelected && !isAllSelected}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      );
    },
    id: 'select',
    size: 28,
  },
  {
    accessorKey: 'description',
    cell: ({ row }) => {
      const txn = row.original;
      const config =
        TYPE_CONFIG[txn.type as TransactionType] || TYPE_CONFIG.expense;
      const Icon = config.icon;
      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
              config.bgColor,
            )}
          >
            <Icon className={cn('size-4', config.iconColor)} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">
              {txn.description || 'Untitled'}
            </span>
            {txn.category && (
              <span className="text-muted-foreground truncate text-xs">
                {txn.category.name}
              </span>
            )}
          </div>
        </div>
      );
    },
    header: 'Description',
    size: 280,
  },
  {
    accessorKey: 'type',
    cell: ({ row }) => {
      const type = row.getValue('type') as TransactionType;
      const config = TYPE_CONFIG[type] || TYPE_CONFIG.expense;
      return (
        <Badge variant={config.badgeVariant} size="sm">
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', config.dotColor)}
          />
          {config.label}
        </Badge>
      );
    },
    header: 'Type',
    size: 120,
  },
  {
    accessorKey: 'amount',
    sortingFn: (rowA, rowB) => {
      return (
        parseFloat(rowA.original.amount as string) -
        parseFloat(rowB.original.amount as string)
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount') as string);
      const type = row.original.type as TransactionType;
      return (
        <div
          className={cn(
            'text-right text-sm font-semibold tabular-nums',
            type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : type === 'expense'
                ? 'text-red-600 dark:text-red-400'
                : 'text-foreground',
          )}
        >
          {type === 'income' ? '+' : type === 'expense' ? '−' : ''}
          <NumberFlowCurrency value={amount} />
        </div>
      );
    },
    header: 'Amount',
    size: 130,
    meta: { align: 'right' },
  },
  {
    accessorKey: 'date',
    cell: ({ row }) => {
      const dateValue = row.getValue('date') as Date | string;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm tabular-nums">
            {getRelativeDate(dateValue)}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatDate(dateValue)}
          </span>
        </div>
      );
    },
    header: 'Date',
    size: 140,
  },
  {
    accessorKey: 'paymentMethod',
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod') as string | null;
      const config = getPaymentMethodConfig(method);
      if (!config)
        return <span className="text-muted-foreground text-sm">—</span>;
      const MethodIcon = config.icon;
      return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <MethodIcon className="size-3.5 shrink-0 opacity-60" />
          <span>{config.label}</span>
        </div>
      );
    },
    header: 'Method',
    size: 120,
  },
  {
    accessorKey: 'bankAccount',
    cell: ({ row }) => {
      const account = row.original.bankAccount;
      if (!account)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <div className="flex items-center gap-1.5">
          {account.color && (
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: account.color }}
            />
          )}
          <span className="text-muted-foreground truncate text-sm">
            {account.name}
          </span>
        </div>
      );
    },
    enableSorting: false,
    header: 'Account',
    size: 150,
  },
];

// ─── Page Size Options ──────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

// ─── Component ──────────────────────────────────────────────────

type TransactionTableProps = {
  data: TransactionWithRelations[];
  totalCount: number;
};

export function TransactionTable({ data, totalCount }: TransactionTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: 'date' },
  ]);

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getRowCount();
  const rangeStart = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <CardFrame className="flex h-[calc(100svh-14rem)] w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto [&_div[data-slot=table-container]]:[-ms-overflow-style:none] [&_div[data-slot=table-container]]:[scrollbar-width:none] [&_div[data-slot=table-container]::-webkit-scrollbar]:hidden">
        <Table className="relative table-fixed">
          <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnSize = header.column.getSize();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        (header.column.columnDef.meta as { align?: string })
                          ?.align === 'right' && 'text-right',
                      )}
                      style={
                        columnSize ? { width: `${columnSize}px` } : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                aria-hidden="true"
                                className="size-4 shrink-0 opacity-80"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="size-4 shrink-0 opacity-80"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="transition-colors duration-150"
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-3" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="h-[calc(100svh-22rem)]"
                  colSpan={columns.length}
                >
                  <Empty className="py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ReceiptText className="size-4.5" />
                      </EmptyMedia>
                      <EmptyTitle>No transactions yet</EmptyTitle>
                      <EmptyDescription>
                        Start tracking your finances by adding your first
                        transaction.
                      </EmptyDescription>
                    </EmptyHeader>
                    <Button
                      size="sm"
                      className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                      <Plus className="mr-1 -ml-1 size-4" />
                      New transaction
                    </Button>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CardFrameFooter className="bg-muted/80 shrink-0 border-t p-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Row count + Rows per page */}
          <div className="flex items-center gap-3 whitespace-nowrap">
            <p className="text-muted-foreground text-sm">
              Showing{' '}
              <strong className="text-foreground font-medium">
                {rangeStart}–{rangeEnd}
              </strong>{' '}
              of{' '}
              <strong className="text-foreground font-medium">
                {totalCount}
              </strong>
            </p>
            <span className="text-border text-sm">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-sm">Rows</span>
              <Select
                value={pageSize}
                onValueChange={(value) => {
                  table.setPageSize(value as number);
                }}
              >
                <SelectTrigger
                  aria-label="Rows per page"
                  className="min-w-none w-fit"
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
          </div>

          {/* Right: Pagination */}
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="sm:*:[svg]:hidden"
                  render={
                    <Button
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="sm:*:[svg]:hidden"
                  render={
                    <Button
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardFrameFooter>
    </CardFrame>
  );
}
