'use server';

import { db } from '@/db';
import { budget } from '@/db/schema/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth.server';

export async function createBudget(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    const categoryId = formData.get('categoryId') as string;
    const amount = formData.get('amount') as string;
    const period = formData.get('period') as string;

    if (!categoryId || !amount || !period) {
      return { success: false, message: 'All fields are required' };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Amount must be a positive number' };
    }

    if (!['monthly', 'weekly', 'yearly'].includes(period)) {
      return { success: false, message: 'Invalid period' };
    }

    await db.insert(budget).values({
      userId: user.id,
      categoryId,
      amount: numAmount.toFixed(2),
      period,
      startDate: new Date(),
      isActive: true,
    });

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, message: 'Budget created successfully' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return {
        success: false,
        message: 'A budget for this category and period already exists',
      };
    }
    return { success: false, message: 'Failed to create budget' };
  }
}

export async function updateBudget(budgetId: string, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    const amount = formData.get('amount') as string;
    const period = formData.get('period') as string;

    if (!amount || !period) {
      return { success: false, message: 'All fields are required' };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Amount must be a positive number' };
    }

    await db
      .update(budget)
      .set({
        amount: numAmount.toFixed(2),
        period,
      })
      .where(and(eq(budget.id, budgetId), eq(budget.userId, user.id)));

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, message: 'Budget updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update budget' };
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const user = await getAuthenticatedUser();

    await db
      .delete(budget)
      .where(and(eq(budget.id, budgetId), eq(budget.userId, user.id)));

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, message: 'Budget deleted successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to delete budget' };
  }
}

export async function toggleBudgetActive(budgetId: string, isActive: boolean) {
  try {
    const user = await getAuthenticatedUser();

    await db
      .update(budget)
      .set({ isActive: !isActive })
      .where(and(eq(budget.id, budgetId), eq(budget.userId, user.id)));

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return {
      success: true,
      message: `Budget ${isActive ? 'paused' : 'activated'} successfully`,
    };
  } catch (error) {
    return { success: false, message: 'Failed to toggle budget' };
  }
}
