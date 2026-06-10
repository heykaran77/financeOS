'use server';

import { db } from '@/db';
import { goal, bankAccount, transaction } from '@/db/schema/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth.server';

export async function createGoal(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const targetAmount = formData.get('targetAmount') as string;
    const targetDate = formData.get('targetDate') as string;

    if (!name || !targetAmount) {
      return { success: false, message: 'Name and target amount are required' };
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return {
        success: false,
        message: 'Target amount must be a positive number',
      };
    }

    await db.insert(goal).values({
      userId: user.id,
      name,
      description: description || null,
      targetAmount: numTarget.toFixed(2),
      targetDate: targetDate ? new Date(targetDate) : null,
      status: 'in_progress',
    });

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true, message: 'Goal created successfully' };
  } catch {
    return { success: false, message: 'Failed to create goal' };
  }
}

export async function updateGoal(goalId: string, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const targetAmount = formData.get('targetAmount') as string;
    const targetDate = formData.get('targetDate') as string;

    if (!name || !targetAmount) {
      return { success: false, message: 'Name and target amount are required' };
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return {
        success: false,
        message: 'Target amount must be a positive number',
      };
    }

    await db
      .update(goal)
      .set({
        name,
        description: description || null,
        targetAmount: numTarget.toFixed(2),
        targetDate: targetDate ? new Date(targetDate) : null,
      })
      .where(and(eq(goal.id, goalId), eq(goal.userId, user.id)));

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true, message: 'Goal updated successfully' };
  } catch {
    return { success: false, message: 'Failed to update goal' };
  }
}

export async function deleteGoal(goalId: string) {
  try {
    const user = await getAuthenticatedUser();

    await db
      .delete(goal)
      .where(and(eq(goal.id, goalId), eq(goal.userId, user.id)));

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true, message: 'Goal deleted successfully' };
  } catch {
    return { success: false, message: 'Failed to delete goal' };
  }
}

export async function addFundsToGoal(
  goalId: string,
  amount: string,
  bankAccountId: string,
) {
  try {
    const user = await getAuthenticatedUser();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Amount must be a positive number' };
    }

    if (!bankAccountId) {
      return { success: false, message: 'Source account is required' };
    }

    // Wrap the entire process in a database transaction
    await db.transaction(async (tx) => {
      // 1. Fetch the goal
      const existingGoal = await tx
        .select({
          currentAmount: goal.currentAmount,
          targetAmount: goal.targetAmount,
          name: goal.name,
        })
        .from(goal)
        .where(and(eq(goal.id, goalId), eq(goal.userId, user.id)))
        .limit(1);

      if (existingGoal.length === 0) {
        throw new Error('Goal not found');
      }

      // 2. Fetch the bank account
      const existingAccount = await tx
        .select({ balance: bankAccount.balance })
        .from(bankAccount)
        .where(
          and(
            eq(bankAccount.id, bankAccountId),
            eq(bankAccount.userId, user.id),
          ),
        )
        .limit(1);

      if (existingAccount.length === 0) {
        throw new Error('Bank account not found');
      }

      // 3. Deduct from bank account
      const newBalance = parseFloat(existingAccount[0].balance) - numAmount;
      await tx
        .update(bankAccount)
        .set({ balance: newBalance.toFixed(2) })
        .where(
          and(
            eq(bankAccount.id, bankAccountId),
            eq(bankAccount.userId, user.id),
          ),
        );

      // 4. Create a transaction record
      await tx.insert(transaction).values({
        userId: user.id,
        bankAccountId: bankAccountId,
        goalId: goalId,
        amount: numAmount.toFixed(2),
        type: 'transfer',
        date: new Date(),
        description: `Added funds to goal: ${existingGoal[0].name}`,
      });

      // 5. Update the goal's current amount and status
      const newCurrent = parseFloat(existingGoal[0].currentAmount) + numAmount;
      const newStatus =
        newCurrent >= parseFloat(existingGoal[0].targetAmount)
          ? 'completed'
          : 'in_progress';

      await tx
        .update(goal)
        .set({
          currentAmount: newCurrent.toFixed(2),
          status: newStatus,
        })
        .where(and(eq(goal.id, goalId), eq(goal.userId, user.id)));
    });

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { success: true, message: 'Funds added successfully' };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      message:
        err.message === 'Goal not found' ||
        err.message === 'Bank account not found'
          ? err.message
          : 'Failed to add funds to goal',
    };
  }
}

export async function toggleGoalStatus(
  goalId: string,
  status: 'in_progress' | 'paused' | 'completed',
) {
  try {
    const user = await getAuthenticatedUser();

    await db
      .update(goal)
      .set({ status })
      .where(and(eq(goal.id, goalId), eq(goal.userId, user.id)));

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return {
      success: true,
      message: `Goal marked as ${status.replace('_', ' ')} successfully`,
    };
  } catch {
    return { success: false, message: 'Failed to update goal status' };
  }
}
