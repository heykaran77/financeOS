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
  Plus,
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

function getPaymentMethodLabel(method: string | null): string {
  if (!method) return '—';
  const labels: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    net_banking: 'Net Banking',
    other: 'Other',
  };
  return labels[method] || method;
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
      return (
        <div className="flex items-center gap-2.5">
          <div className="bg-secondary flex size-8 shrink-0 items-center justify-center rounded-full">
            {txn.type === 'income' ? (
              <ArrowDownRight className="size-4 text-emerald-600 dark:text-emerald-300" />
            ) : txn.type === 'expense' ? (
              <ArrowUpRight className="size-4 text-red-600 dark:text-red-300" />
            ) : (
              <ArrowRightLeft className="size-4 text-blue-600 dark:text-blue-300" />
            )}
          </div>
          <div className="flex min-w-0 flex-col">
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
    size: 250,
  },
  {
    accessorKey: 'type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant="secondary" size="sm" className="font-normal capitalize">
          {type}
        </Badge>
      );
    },
    header: 'Type',
    size: 110,
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
      const type = row.original.type;
      return (
        <div
          className={cn(
            'text-sm font-medium tabular-nums',
            type === 'income'
              ? 'text-emerald-600 dark:text-emerald-300'
              : type === 'expense'
                ? 'text-red-600 dark:text-red-300'
                : 'text-foreground',
          )}
        >
          {type === 'income' ? '+' : type === 'expense' ? '−' : ''}
          <NumberFlowCurrency value={amount} />
        </div>
      );
    },
    header: 'Amount',
    size: 140,
  },
  {
    accessorKey: 'date',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm tabular-nums">
        {formatDate(row.getValue('date'))}
      </span>
    ),
    header: 'Date',
    size: 120,
  },
  {
    accessorKey: 'paymentMethod',
    cell: ({ row }) => (
      <Badge variant="outline" size="sm" className="font-normal">
        {getPaymentMethodLabel(row.getValue('paymentMethod'))}
      </Badge>
    ),
    header: 'Method',
    size: 110,
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
              className="size-2 rounded-full"
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

// ─── Component ──────────────────────────────────────────────────

type TransactionTableProps = {
  data: TransactionWithRelations[];
  totalCount: number;
};

export function TransactionTable({ data, totalCount }: TransactionTableProps) {
  const pageSize = 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
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

  return (
    <CardFrame className="flex h-[calc(100svh-14rem)] w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto [&_div[data-slot=table-container]]:[-ms-overflow-style:none] [&_div[data-slot=table-container]]:[scrollbar-width:none] [&_div[data-slot=table-container]::-webkit-scrollbar]:hidden">
        <Table className="relative table-fixed">
          <TableHeader className="sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnSize = header.column.getSize();
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-muted/80 backdrop-blur-md"
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
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-[calc(100svh-22rem)] text-center"
                  colSpan={columns.length}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground text-sm tracking-tight md:text-lg">
                      No transactions found.
                    </p>
                    <Button
                      size="sm"
                      className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                      <Plus className="mr-1 -ml-1 size-5" />
                      New transaction
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CardFrameFooter className="bg-muted/80 shrink-0 border-t p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          {/* Results range selector */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <p className="text-muted-foreground text-sm">Viewing</p>
            <Select
              items={Array.from({ length: table.getPageCount() }, (_, i) => {
                const start = i * table.getState().pagination.pageSize + 1;
                const end = Math.min(
                  (i + 1) * table.getState().pagination.pageSize,
                  table.getRowCount(),
                );
                const pageNum = i + 1;
                return { label: `${start}-${end}`, value: pageNum };
              })}
              onValueChange={(value) => {
                table.setPageIndex((value as number) - 1);
              }}
              value={table.getState().pagination.pageIndex + 1}
            >
              <SelectTrigger
                aria-label="Select result range"
                className="min-w-none w-fit"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {Array.from({ length: table.getPageCount() }, (_, i) => {
                  const start = i * table.getState().pagination.pageSize + 1;
                  const end = Math.min(
                    (i + 1) * table.getState().pagination.pageSize,
                    table.getRowCount(),
                  );
                  const pageNum = i + 1;
                  return (
                    <SelectItem key={pageNum} value={pageNum}>
                      {`${start}-${end}`}
                    </SelectItem>
                  );
                })}
              </SelectPopup>
            </Select>
            <p className="text-muted-foreground text-sm">
              of{' '}
              <strong className="text-foreground font-medium">
                {totalCount}
              </strong>{' '}
              results
            </p>
          </div>

          {/* Pagination */}
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
