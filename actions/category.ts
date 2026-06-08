'use server';

import { db } from '@/db';
import { category } from '@/db/schema/schema';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth.server';

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
    return {
      success: true,
      message: 'Category created successfully',
      data: created,
    };
  } catch (error) {
    return { success: false, message: 'Failed to create category' };
  }
}
