'use strict';

import { z } from 'zod';

// ─── Account Type Enum ─────────────────────────────────────────────

export const AccountTypeEnum = z.enum([
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
  'other',
]);
export type AccountType = z.infer<typeof AccountTypeEnum>;

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
  other: 'Other',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  checking: 'Landmark',
  savings: 'PiggyBank',
  credit_card: 'CreditCard',
  cash: 'Wallet',
  investment: 'TrendingUp',
  other: 'CircleDollarSign',
};

// ─── Add Account Schema ────────────────────────────────────────────

export const AddAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Name must be at most 100 characters'),
  type: AccountTypeEnum,
  balance: z
    .number({ error: 'Initial balance is required' })
    .min(-99_999_999, 'Balance is too small')
    .max(99_999_999, 'Balance is too large'),
  currency: z.string().min(1),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .optional(),
  icon: z.string().max(10).optional(),
});

export type AddAccountSchemaType = z.infer<typeof AddAccountSchema>;
