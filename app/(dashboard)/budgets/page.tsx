import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { getAllBudgets, getUserCategories } from '@/lib/queries/budget.queries';
import { BudgetGrid } from './_components/budget-grid';
import { CreateBudgetDialog } from '@/components/common/quick-actions/create-budget-dialog';
import { CreateCategoryDialog } from '@/components/common/quick-actions/create-category-dialog';
import SectionHeading from '@/components/common/SectionHeading';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ButtonGroup } from '@/components/ui/group';
import { Button } from '@/components/ui/button';
import { Plus, FolderPlus } from 'lucide-react';

function BudgetGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardFrame key={i} className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="size-7 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </CardFrame>
      ))}
    </div>
  );
}

export default async function BudgetsPage() {
  const user = await getAuthenticatedUser();

  // Kick off data promises
  const budgetsPromise = getAllBudgets(user.id);
  const categoriesPromise = getUserCategories(user.id);

  // We need categories for the trigger button too — await them for the header
  const categories = await categoriesPromise;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <SectionHeading
          heading="Budgets"
          subHeading="Create and manage spending limits per category."
        />
        <ButtonGroup>
          <CreateBudgetDialog
            categories={categories}
            withTrigger
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="size-4" />
                Budget
              </Button>
            }
          />
          <CreateCategoryDialog
            withTrigger
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <FolderPlus className="size-4" />
                Category
              </Button>
            }
          />
        </ButtonGroup>
      </div>

      <Suspense fallback={<BudgetGridSkeleton />}>
        <BudgetGrid
          budgetsPromise={budgetsPromise}
          categoriesPromise={getUserCategories(user.id)}
        />
      </Suspense>
    </div>
  );
}
