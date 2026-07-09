'use server';

import { db } from '@/db';
import { bankAccount } from '@/db/schema/schema';
import { getAuthenticatedUser } from '@/lib/auth.server';
import {
  AddAccountSchema,
  type AddAccountSchemaType,
} from '@/types/accountSchema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type AccountActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

// ─── Create Account ─────────────────────────────────────────────

export async function createAccount(
  data: AddAccountSchemaType,
): Promise<AccountActionResult> {
  const parsed = AddAccountSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid data',
    };
  }

  try {
    const user = await getAuthenticatedUser();
    const { name, type, balance, currency, color, icon } = parsed.data;

    await db.insert(bankAccount).values({
      userId: user.id,
      name,
      type,
      balance: balance.toFixed(2),
      currency: currency || 'INR',
      color: color || null,
      icon: icon || null,
    });

    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return { success: true, message: `${name} account created successfully` };
  } catch {
    console.error('[createAccount]');
    return { success: false, message: 'Failed to create account' };
  }
}

// ─── Archive Account ────────────────────────────────────────────

export async function archiveAccount(
  accountId: string,
): Promise<AccountActionResult> {
  try {
    const user = await getAuthenticatedUser();

    const [existing] = await db
      .select({ id: bankAccount.id })
      .from(bankAccount)
      .where(
        and(eq(bankAccount.id, accountId), eq(bankAccount.userId, user.id)),
      )
      .limit(1);

    if (!existing) {
      return { success: false, message: 'Account not found' };
    }

    await db
      .update(bankAccount)
      .set({ isArchived: true })
      .where(
        and(eq(bankAccount.id, accountId), eq(bankAccount.userId, user.id)),
      );

    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return { success: true, message: 'Account archived' };
  } catch {
    console.error('[archiveAccount]');
    return { success: false, message: 'Failed to archive account' };
  }
}

// ─── Update Account ─────────────────────────────────────────────

export async function updateAccount(
  accountId: string,
  data: AddAccountSchemaType,
): Promise<AccountActionResult> {
  const parsed = AddAccountSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid data',
    };
  }

  try {
    const user = await getAuthenticatedUser();
    const { name, type, balance, currency, color, icon } = parsed.data;

    const [existing] = await db
      .select({ id: bankAccount.id })
      .from(bankAccount)
      .where(
        and(eq(bankAccount.id, accountId), eq(bankAccount.userId, user.id)),
      )
      .limit(1);

    if (!existing) {
      return { success: false, message: 'Account not found' };
    }

    await db
      .update(bankAccount)
      .set({
        name,
        type,
        balance: balance.toFixed(2),
        currency: currency || 'INR',
        color: color || null,
        icon: icon || null,
      })
      .where(
        and(eq(bankAccount.id, accountId), eq(bankAccount.userId, user.id)),
      );

    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return { success: true, message: 'Account updated successfully' };
  } catch {
    console.error('[updateAccount]');
    return { success: false, message: 'Failed to update account' };
  }
}
