'use client';

import { use, useState } from 'react';
import { BudgetCard } from './budget-card';
import { CreateBudgetDialog } from '@/components/common/quick-actions/create-budget-dialog';
import { CreateCategoryDialog } from '@/components/common/quick-actions/create-category-dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Plus, PiggyBank, FolderPlus } from 'lucide-react';
import type { BudgetItem, CategoryItem } from '@/lib/queries/budget.queries';

interface BudgetGridProps {
  budgetsPromise: Promise<BudgetItem[]>;
  categoriesPromise: Promise<CategoryItem[]>;
}

export function BudgetGrid({
  budgetsPromise,
  categoriesPromise,
}: BudgetGridProps) {
  const budgets = use(budgetsPromise);
  const categories = use(categoriesPromise);

  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  if (budgets.length === 0) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PiggyBank aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No budgets yet</EmptyTitle>
            <EmptyDescription>
              Create your first budget to start tracking spending limits per
              category. You&apos;ll see exactly how much you&apos;ve spent vs
              your limit.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => setCreateOpen(true)}
              className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <Plus className="mr-1 -ml-1 size-5" />
              Create Your First Budget
            </Button>
          </EmptyContent>
        </Empty>

        <CreateBudgetDialog
          categories={categories}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </>
    );
  }

  // Separate active and inactive budgets
  const activeBudgets = budgets.filter((b) => b.isActive);
  const inactiveBudgets = budgets.filter((b) => !b.isActive);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Active Budgets */}
        {activeBudgets.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-muted-foreground text-sm font-medium">
                Active Budgets ({activeBudgets.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeBudgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))}
            </div>
          </section>
        )}

        {/* Inactive Budgets */}
        {inactiveBudgets.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-muted-foreground text-sm font-medium">
                Paused Budgets ({inactiveBudgets.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveBudgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CreateBudgetDialog
        categories={categories}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
