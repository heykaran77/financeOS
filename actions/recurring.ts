'use server';

import { db } from '@/db';
import { recurringTransaction } from '@/db/schema/schema';
import { getAuthenticatedUser } from '@/lib/auth.server';
import {
  AddRecurringTransactionSchema,
  type AddRecurringTransactionSchemaType,
} from '@/types/recurringSchema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type RecurringActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

// ─── Create Recurring Transaction ───────────────────────────────

export async function createRecurringTransaction(
  data: AddRecurringTransactionSchemaType,
): Promise<RecurringActionResult> {
  const parsed = AddRecurringTransactionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid data',
    };
  }

  try {
    const user = await getAuthenticatedUser();
    const {
      description,
      amount,
      type,
      frequency,
      nextDueDate,
      bankAccountId,
      categoryId,
    } = parsed.data;

    await db.insert(recurringTransaction).values({
      userId: user.id,
      description,
      amount: amount.toFixed(2),
      type,
      frequency,
      nextDueDate,
      bankAccountId: bankAccountId || null,
      categoryId: categoryId || null,
      isActive: true,
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Recurring ${type} "${description}" created`,
    };
  } catch {
    console.error('[createRecurringTransaction]');
    return {
      success: false,
      message: 'Failed to create recurring transaction',
    };
  }
}

// ─── Toggle Recurring Transaction ───────────────────────────────

export async function toggleRecurringTransaction(
  id: string,
): Promise<RecurringActionResult> {
  try {
    const user = await getAuthenticatedUser();

    const existing = await db.query.recurringTransaction.findFirst({
      where: and(
        eq(recurringTransaction.id, id),
        eq(recurringTransaction.userId, user.id),
      ),
      columns: { id: true, isActive: true },
    });

    if (!existing) {
      return { success: false, message: 'Recurring transaction not found' };
    }

    await db
      .update(recurringTransaction)
      .set({ isActive: !existing.isActive })
      .where(
        and(
          eq(recurringTransaction.id, id),
          eq(recurringTransaction.userId, user.id),
        ),
      );

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: existing.isActive ? 'Paused' : 'Resumed',
    };
  } catch {
    console.error('[toggleRecurringTransaction]');
    return {
      success: false,
      message: 'Failed to update recurring transaction',
    };
  }
}

// ─── Delete Recurring Transaction ───────────────────────────────

export async function deleteRecurringTransaction(
  id: string,
): Promise<RecurringActionResult> {
  try {
    const user = await getAuthenticatedUser();

    const existing = await db.query.recurringTransaction.findFirst({
      where: and(
        eq(recurringTransaction.id, id),
        eq(recurringTransaction.userId, user.id),
      ),
      columns: { id: true },
    });

    if (!existing) {
      return { success: false, message: 'Recurring transaction not found' };
    }

    await db
      .delete(recurringTransaction)
      .where(
        and(
          eq(recurringTransaction.id, id),
          eq(recurringTransaction.userId, user.id),
        ),
      );

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return { success: true, message: 'Recurring transaction deleted' };
  } catch {
    console.error('[deleteRecurringTransaction]');
    return {
      success: false,
      message: 'Failed to delete recurring transaction',
    };
  }
}
