'use client';

import { use, useState } from 'react';
import { GoalCard } from './goal-card';
import { CreateGoalDialog } from '@/components/common/quick-actions/create-goal-dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import type { GoalItem } from '@/lib/queries/goal.queries';
import type { BankAccountRow } from '@/lib/queries/account.queries';

interface GoalsGridProps {
  goalsPromise: Promise<GoalItem[]>;
  bankAccountsPromise: Promise<BankAccountRow[]>;
}

export function GoalsGrid({
  goalsPromise,
  bankAccountsPromise,
}: GoalsGridProps) {
  const goals = use(goalsPromise);
  const bankAccounts = use(bankAccountsPromise);
  const [createOpen, setCreateOpen] = useState(false);

  if (goals.length === 0) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No goals yet</EmptyTitle>
            <EmptyDescription>
              Set your first financial goal to start tracking your savings for a
              new car, emergency fund, or vacation.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => setCreateOpen(true)}
              className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <Plus className="mr-1 -ml-1 size-5" />
              Create Your First Goal
            </Button>
          </EmptyContent>
        </Empty>

        <CreateGoalDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  const inProgressGoals = goals.filter((g) => g.status === 'in_progress');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const pausedGoals = goals.filter((g) => g.status === 'paused');

  return (
    <div className="flex flex-col gap-8">
      {inProgressGoals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-medium tracking-tight">
              In Progress ({inProgressGoals.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inProgressGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} bankAccounts={bankAccounts} />
            ))}
          </div>
        </section>
      )}

      {pausedGoals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-medium tracking-tight">
              Paused ({pausedGoals.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pausedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} bankAccounts={bankAccounts} />
            ))}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-medium tracking-tight">
              Completed ({completedGoals.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} bankAccounts={bankAccounts} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
