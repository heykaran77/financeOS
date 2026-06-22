import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { getCategoryListOverview } from '@/lib/queries/category.queries';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryAnalytics } from '@/components/common/category-analytics';
import { CategoryActions } from '@/components/common/category-actions';
import { NumberFlowCurrency } from '@/components/common/number-flow-currency';
import { CreateCategoryDialog } from '@/components/common/quick-actions/create-category-dialog';
import { CATEGORY_ICONS } from '@/lib/icons';
import SectionHeading from '@/components/common/SectionHeading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type CategoryOverviewItem = Awaited<
  ReturnType<typeof getCategoryListOverview>
>[number];

export const metadata = {
  title: 'Categories | Finance OS',
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <SectionHeading
          heading="Categories"
          subHeading="Manage your custom categories and view spending analytics."
        />
        <CreateCategoryDialog
          withTrigger
          trigger={
            <Button>
              <Plus className="mr-2 size-4" />
              Add Category
            </Button>
          }
        />
      </div>

      {/* Analytics Component — client-side with its own loading state */}
      <CategoryAnalytics />

      {/* Categories List — server-fetched, wrapped in Suspense */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesList />
      </Suspense>
    </div>
  );
}

function CategorySection({
  title,
  items,
}: {
  title: string;
  items: CategoryOverviewItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="border-border bg-card flex flex-col rounded-xl border shadow-sm">
        <div className="border-border border-b p-4">
          <h2 className="text-foreground font-semibold">{title}</h2>
        </div>
        <div className="text-muted-foreground p-8 text-center text-sm">
          No categories found.
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card flex flex-col rounded-xl border shadow-sm">
      <div className="border-border border-b p-4">
        <h2 className="text-foreground font-semibold">
          {title} ({items.length})
        </h2>
      </div>
      <div className="flex flex-col divide-y">
        {items.map((cat) => {
          const Icon = cat.icon ? CATEGORY_ICONS[cat.icon] : null;

          return (
            <div
              key={cat.id}
              className="hover:bg-muted/50 flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: cat.color || '#cccccc' }}
                >
                  {Icon ? (
                    <Icon className="size-5" />
                  ) : (
                    <span>{cat.icon || '🏷️'}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">
                    {cat.name}
                    {cat.isDefault && (
                      <span className="bg-secondary text-secondary-foreground ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase">
                        Default
                      </span>
                    )}
                  </span>
                  {cat.budgetLimit > 0 && (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      Budget limit:{' '}
                      <NumberFlowCurrency value={cat.budgetLimit} />
                    </span>
                  )}
                </div>
              </div>

              {!cat.isDefault && (
                <div className="flex items-center gap-2">
                  <CategoryActions
                    category={{
                      id: cat.id,
                      name: cat.name,
                      icon: cat.icon,
                      color: cat.color,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function CategoriesList() {
  const user = await getAuthenticatedUser();
  const categories = await getCategoryListOverview(user.id);

  const expenses = categories.filter((c) => c.type === 'expense');
  const incomes = categories.filter((c) => c.type === 'income');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CategorySection title="Expense Categories" items={expenses} />
      <CategorySection title="Income Categories" items={incomes} />
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border-border bg-card flex flex-col rounded-xl border shadow-sm"
        >
          <div className="border-border border-b p-4">
            <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="flex flex-col space-y-4 p-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
