'use server';

import { db } from '@/db';
import { transaction, bankAccount } from '@/db/schema/schema';
import { getAuthenticatedUser } from '@/lib/auth.server';
import {
  AddTransactionSchema,
  type AddTransactionSchemaType,
} from '@/types/transactionSchema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type CreateTransactionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function createTransaction(
  data: AddTransactionSchemaType,
): Promise<CreateTransactionResult> {
  // Server-side re-validation (never trust the client alone)
  const parsed = AddTransactionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid data',
    };
  }

  try {
    const user = await getAuthenticatedUser();
    const {
      type,
      amount,
      date,
      description,
      categoryId,
      bankAccountId,
      paymentMethod,
      source,
      toAccountId,
    } = parsed.data;

    await db.transaction(async (tx) => {
      // 1. Insert the transaction record
      await tx.insert(transaction).values({
        userId: user.id,
        type,
        amount: amount.toFixed(2),
        date,
        description: description ?? null,
        categoryId: categoryId ?? null,
        bankAccountId: bankAccountId ?? null,
        paymentMethod: paymentMethod ?? null,
        source: source ?? null,
        isRecurring: false,
      });

      // 2. Update account balance(s) if an account was selected
      if (bankAccountId) {
        const [account] = await tx
          .select({ balance: bankAccount.balance })
          .from(bankAccount)
          .where(
            and(
              eq(bankAccount.id, bankAccountId),
              eq(bankAccount.userId, user.id),
            ),
          )
          .limit(1);

        if (!account) {
          throw new Error('Source account not found');
        }

        const currentBalance = parseFloat(account.balance);
        let newBalance: number;

        if (type === 'income') {
          // Income → add to account
          newBalance = currentBalance + amount;
        } else if (type === 'expense') {
          // Expense → deduct from account
          newBalance = currentBalance - amount;
        } else {
          // Transfer → deduct from source account
          newBalance = currentBalance - amount;
        }

        await tx
          .update(bankAccount)
          .set({ balance: newBalance.toFixed(2) })
          .where(
            and(
              eq(bankAccount.id, bankAccountId),
              eq(bankAccount.userId, user.id),
            ),
          );

        // For transfers, also credit the destination account
        if (type === 'transfer' && toAccountId) {
          const [toAccount] = await tx
            .select({ balance: bankAccount.balance })
            .from(bankAccount)
            .where(
              and(
                eq(bankAccount.id, toAccountId),
                eq(bankAccount.userId, user.id),
              ),
            )
            .limit(1);

          if (!toAccount) {
            throw new Error('Destination account not found');
          }

          const toNewBalance = parseFloat(toAccount.balance) + amount;
          await tx
            .update(bankAccount)
            .set({ balance: toNewBalance.toFixed(2) })
            .where(
              and(
                eq(bankAccount.id, toAccountId),
                eq(bankAccount.userId, user.id),
              ),
            );
        }
      }
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return { success: true, message: 'Transaction added successfully' };
  } catch (error) {
    console.error('[createTransaction]', error);
    const err = error as Error;
    if (
      err.message === 'Source account not found' ||
      err.message === 'Destination account not found'
    ) {
      return { success: false, message: err.message };
    }
    return { success: false, message: 'Failed to add transaction' };
  }
}
