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
      // 0. Intercept default-cash and create a real account on the fly if needed
      let finalBankAccountId = bankAccountId || null;

      if (finalBankAccountId === 'default-cash') {
        const [newCashAccount] = await tx
          .insert(bankAccount)
          .values({
            userId: user.id,
            name: 'Cash',
            type: 'cash',
            currency: 'INR',
            color: '#10b981',
            balance: '0',
          })
          .returning({ id: bankAccount.id });

        finalBankAccountId = newCashAccount.id;
      }

      // 1. Insert the transaction record
      await tx.insert(transaction).values({
        userId: user.id,
        type,
        amount: amount.toFixed(2),
        date,
        description: description || null,
        categoryId: categoryId || null,
        bankAccountId: finalBankAccountId,
        paymentMethod: paymentMethod || null,
        source: source || null,
        isRecurring: false,
      });

      // 2. Update account balance(s) if an account was selected
      if (finalBankAccountId) {
        const [account] = await tx
          .select({
            balance: bankAccount.balance,
            type: bankAccount.type,
            name: bankAccount.name,
          })
          .from(bankAccount)
          .where(
            and(
              eq(bankAccount.id, finalBankAccountId),
              eq(bankAccount.userId, user.id),
            ),
          )
          .limit(1);

        if (!account) {
          throw new Error('Source account not found');
        }

        if (account.type === 'credit_card' && type === 'income') {
          throw new Error(
            'Cannot add income directly to a credit card account',
          );
        }

        // Block expenses/transfers that exceed balance (credit cards exempt)
        if (
          (type === 'expense' || type === 'transfer') &&
          account.type !== 'credit_card' &&
          parseFloat(account.balance) < amount
        ) {
          const available = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
          }).format(parseFloat(account.balance));
          throw new Error(
            `Insufficient balance in ${account.name}. Available: ${available}`,
          );
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
              eq(bankAccount.id, finalBankAccountId),
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
      err.message === 'Destination account not found' ||
      err.message === 'Cannot add income directly to a credit card account' ||
      err.message.startsWith('Insufficient balance')
    ) {
      return { success: false, message: err.message };
    }
    return { success: false, message: 'Failed to add transaction' };
  }
}

export async function deleteTransactions(
  transactionIds: string[],
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getAuthenticatedUser();

    await db.transaction(async (tx) => {
      for (const id of transactionIds) {
        // Find the transaction
        const [txn] = await tx
          .select()
          .from(transaction)
          .where(and(eq(transaction.id, id), eq(transaction.userId, user.id)))
          .limit(1);

        if (!txn) {
          throw new Error(`Transaction ${id} not found`);
        }

        const amount = parseFloat(txn.amount);

        // Reverse the balance change
        if (txn.bankAccountId) {
          const [account] = await tx
            .select({ balance: bankAccount.balance })
            .from(bankAccount)
            .where(
              and(
                eq(bankAccount.id, txn.bankAccountId),
                eq(bankAccount.userId, user.id),
              ),
            )
            .limit(1);

          if (account) {
            let newBalance = parseFloat(account.balance);
            if (txn.type === 'expense') {
              newBalance += amount;
            } else if (txn.type === 'income') {
              newBalance -= amount;
            } else if (txn.type === 'transfer') {
              newBalance += amount; // Add back to source
            }

            await tx
              .update(bankAccount)
              .set({ balance: newBalance.toFixed(2) })
              .where(
                and(
                  eq(bankAccount.id, txn.bankAccountId),
                  eq(bankAccount.userId, user.id),
                ),
              );
          }
        }

        // For transfers, also reverse destination account
        // Note: The database schema currently doesn't store the `toAccountId`
        // so we can only revert the balance on the source account (`bankAccountId`).

        // Finally, delete the transaction
        await tx
          .delete(transaction)
          .where(and(eq(transaction.id, id), eq(transaction.userId, user.id)));
      }
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return { success: true, message: 'Transactions deleted successfully' };
  } catch (error) {
    console.error('[deleteTransactions]', error);
    return { success: false, message: 'Failed to delete transactions' };
  }
}
