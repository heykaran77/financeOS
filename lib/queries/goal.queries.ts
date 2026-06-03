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
    progress: Math.min((Number(row.current) / Number(row.target)) * 100, 100),
  }));
}
