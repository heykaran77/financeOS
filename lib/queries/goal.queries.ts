import { db } from '@/db';
import { goal } from '@/db/schema/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Get active goals and their progress.
 */
export async function getGoalsProgress(userId: string) {
  const results = await db
    .select({
      id: goal.id,
      name: goal.name,
      target: goal.targetAmount,
      current: goal.currentAmount,
    })
    .from(goal)
    .where(and(eq(goal.userId, userId), eq(goal.status, 'in_progress')))
    .orderBy(desc(goal.createdAt));

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    target: Number(row.target),
    current: Number(row.current),
    progress:
      Number(row.target) > 0
        ? (Number(row.current) / Number(row.target)) * 100
        : 0,
  }));
}

/**
 * Get all goals for a user.
 */
export async function getAllGoals(userId: string) {
  const results = await db
    .select({
      id: goal.id,
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      status: goal.status,
      createdAt: goal.createdAt,
    })
    .from(goal)
    .where(eq(goal.userId, userId))
    .orderBy(desc(goal.createdAt));

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    target: Number(row.targetAmount),
    current: Number(row.currentAmount),
    targetDate: row.targetDate ? new Date(row.targetDate) : null,
    status: row.status as 'in_progress' | 'completed' | 'paused',
    progress:
      Number(row.targetAmount) > 0
        ? (Number(row.currentAmount) / Number(row.targetAmount)) * 100
        : 0,
    createdAt: row.createdAt,
  }));
}

export type GoalItem = Awaited<ReturnType<typeof getAllGoals>>[number];
