'use server';

import { db } from '@/db';
import { category } from '@/db/schema/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { getCategorySpendingAnalytics } from '@/lib/queries/category.queries';

export async function createCategory(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const color = formData.get('color') as string | null;
    const icon = formData.get('icon') as string | null;

    if (!name || !type) {
      return { success: false, message: 'Name and type are required' };
    }

    if (!['expense', 'income'].includes(type)) {
      return { success: false, message: 'Invalid category type' };
    }

    const [created] = await db
      .insert(category)
      .values({
        userId: user.id,
        name: name.trim(),
        type,
        color: color || null,
        icon: icon || null,
        isDefault: false,
      })
      .returning({ id: category.id, name: category.name });

    revalidatePath('/budgets');
    revalidatePath('/categories');
    return {
      success: true,
      message: 'Category created successfully',
      data: created,
    };
  } catch {
    return { success: false, message: 'Failed to create category' };
  }
}

export async function updateCategory(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const color = formData.get('color') as string | null;
    const icon = formData.get('icon') as string | null;

    if (!id || !name) {
      return { success: false, message: 'ID and name are required' };
    }

    // We do not allow updating the 'type' of an existing category
    // because it could orphan or confuse existing transactions/budgets.
    // We also only allow updating if it belongs to the user.

    const [updated] = await db
      .update(category)
      .set({
        name: name.trim(),
        color: color || null,
        icon: icon || null,
      })
      .where(
        and(
          eq(category.id, id),
          eq(category.userId, user.id),
          eq(category.isDefault, false),
        ),
      )
      .returning({ id: category.id });

    if (!updated) {
      return {
        success: false,
        message: 'Category not found or cannot be edited',
      };
    }

    revalidatePath('/budgets');
    revalidatePath('/categories');
    return {
      success: true,
      message: 'Category updated successfully',
    };
  } catch {
    return { success: false, message: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await getAuthenticatedUser();

    // Only allow deleting user's custom categories
    const [deleted] = await db
      .delete(category)
      .where(
        and(
          eq(category.id, id),
          eq(category.userId, user.id),
          eq(category.isDefault, false),
        ),
      )
      .returning({ id: category.id });

    if (!deleted) {
      return {
        success: false,
        message: 'Category not found or cannot be deleted',
      };
    }

    revalidatePath('/budgets');
    revalidatePath('/categories');
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to delete category (it may be in use)',
    };
  }
}

export async function getCategoryAnalyticsAction(
  period: 'weekly' | 'monthly' | 'yearly' | 'all',
) {
  const user = await getAuthenticatedUser();
  return getCategorySpendingAnalytics(user.id, period);
}
