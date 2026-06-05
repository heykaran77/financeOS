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

const columnHelper = createColumnHelper<UpcomingPaymentRow>();

const columns = [
  columnHelper.accessor('nextDueDate', {
    header: 'Due Date',
    cell: (info) => (
      <span className="pr-4 whitespace-nowrap">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor('description', {
    header: 'Bill',
    cell: (info) => (
      <span className="truncate">{info.getValue() || 'Subscription'}</span>
    ),
  }),
];

export function UpcomingPaymentsTable({
  data,
}: {
  data: UpcomingPaymentRow[];
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
                <TableHead key={header.id} className="font-mono">
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
                No upcoming payments.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
