import { z } from 'zod';

// ─── Shared Enums ─────────────────────────────────────────────────

export const TransactionTypeEnum = z.enum(['expense', 'income', 'transfer']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const PaymentMethodEnum = z.enum([
  'cash',
  'upi',
  'card',
  'net_banking',
  'other',
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// ─── Add Transaction Schema ────────────────────────────────────────
// Used by the "Add Transaction" dialog form.

export const AddTransactionSchema = z
  .object({
    type: TransactionTypeEnum,
    amount: z
      .number({ error: 'Amount is required' })
      .positive('Amount must be greater than 0')
      .max(99_999_999, 'Amount is too large'),
    date: z.date({ message: 'Date is required' }),
    description: z
      .string()
      .max(255, 'Description must be at most 255 characters')
      .optional(),
    categoryId: z.string().optional(),
    bankAccountId: z.string().optional(),
    paymentMethod: PaymentMethodEnum.optional(),
    // Only relevant when type === 'income'
    source: z
      .string()
      .max(100, 'Source must be at most 100 characters')
      .optional(),
    // Only relevant when type === 'transfer'
    toAccountId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'transfer' && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Destination account is required for transfers',
        path: ['toAccountId'],
      });
    }
  });

export type AddTransactionSchemaType = z.infer<typeof AddTransactionSchema>;

// ─── CSV Upload Schema ─────────────────────────────────────────────
// Placeholder schema for future CSV/Excel import validation.

export const CsvUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine(
      (f) =>
        [
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ].includes(f.type),
      { message: 'Only CSV or Excel (.xlsx, .xls) files are accepted' },
    )
    .refine((f) => f.size <= 5 * 1024 * 1024, {
      message: 'File size must be 5 MB or less',
    }),
});

export type CsvUploadSchemaType = z.infer<typeof CsvUploadSchema>;
