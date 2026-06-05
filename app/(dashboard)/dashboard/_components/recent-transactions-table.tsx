'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TransactionWithRelations } from '@/lib/queries/transaction.queries';

const formatCurrency = (val: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));

const columnHelper = createColumnHelper<TransactionWithRelations>();

const columns = [
  columnHelper.accessor('description', {
    header: 'Transaction',
    cell: (info) => {
      const tx = info.row.original;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none font-medium">
            {tx.description || tx.category?.name || 'Transaction'}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatDate(tx.date)}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor('amount', {
    header: () => <div className="text-right">Amount</div>,
    cell: (info) => {
      const tx = info.row.original;
      return (
        <div
          className={`text-right text-sm font-medium ${
            tx.type === 'expense' ? '' : 'text-emerald-500'
          }`}
        >
          {tx.type === 'expense' ? '-' : '+'}
          {formatCurrency(tx.amount)}
        </div>
      );
    },
  }),
];

export function RecentTransactionsTable({
  data,
}: {
  data: TransactionWithRelations[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No recent transactions.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
