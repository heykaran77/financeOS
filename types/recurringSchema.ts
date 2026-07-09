import { z } from 'zod';

// ─── Frequency Enum ────────────────────────────────────────────────

export const FrequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
export type Frequency = z.infer<typeof FrequencyEnum>;

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// ─── Recurring Transaction Type ────────────────────────────────────

export const RecurringTypeEnum = z.enum(['expense', 'income']);
export type RecurringType = z.infer<typeof RecurringTypeEnum>;

// ─── Add Recurring Transaction Schema ──────────────────────────────

export const AddRecurringTransactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description must be at most 255 characters'),
  amount: z
    .number({ error: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .max(99_999_999, 'Amount is too large'),
  type: RecurringTypeEnum,
  frequency: FrequencyEnum,
  nextDueDate: z.date({ message: 'Next due date is required' }),
  bankAccountId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type AddRecurringTransactionSchemaType = z.infer<
  typeof AddRecurringTransactionSchema
>;
