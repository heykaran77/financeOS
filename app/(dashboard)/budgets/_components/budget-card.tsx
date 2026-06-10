'use client';

import { useState, useTransition } from 'react';
import { CardFrame } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from '@/components/ui/meter';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from '@/components/ui/menu';
import { Button } from '@/components/ui/button';
import { NumberFlowCurrency } from '@/components/common/number-flow-currency';
import { EditBudgetDialog } from '@/components/common/quick-actions/edit-budget-dialog';
import { DeleteBudgetDialog } from '@/components/common/quick-actions/delete-budget-dialog';
import { toggleBudgetActive } from '@/actions/budget';
import type { BudgetItem } from '@/lib/queries/budget.queries';
import { CATEGORY_ICONS } from '@/lib/icons';
import { MoreVertical, Pencil, Trash2, Pause, Play } from 'lucide-react';

function getMeterColor(progress: number, isActive: boolean): string {
  if (!isActive) return 'var(--color-neutral-400)';
  if (progress > 100) return 'var(--color-red-400)';
  if (progress >= 75) return 'var(--color-amber-400)';
  return 'var(--color-emerald-400)';
}

function getStatusInfo(
  progress: number,
  isActive: boolean,
): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
} {
  if (!isActive) return { label: 'Paused', variant: 'secondary' };
  if (progress > 100) return { label: 'Over budget', variant: 'destructive' };
  if (progress >= 75) return { label: 'Caution', variant: 'warning' };
  return { label: 'On track', variant: 'success' };
}

const periodLabel: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  yearly: 'Yearly',
};

export function BudgetCard({ budget }: { budget: BudgetItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isToggling, startToggle] = useTransition();

  const status = getStatusInfo(budget.progress, budget.isActive);
  const meterColor = getMeterColor(budget.progress, budget.isActive);
  const cappedProgress = Math.min(budget.progress, 100);

  function handleToggle() {
    startToggle(async () => {
      await toggleBudgetActive(budget.id, budget.isActive);
    });
  }

  return (
    <>
      <CardFrame
        className={`flex flex-col gap-4 p-5 transition-opacity ${!budget.isActive ? 'opacity-60' : ''}`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            {/* Category Color Dot + Icon */}
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg"
              style={{
                backgroundColor: budget.color
                  ? `${budget.color}20`
                  : 'var(--color-neutral-100)',
                color: budget.color ?? 'inherit',
              }}
            >
              {budget.categoryIcon && CATEGORY_ICONS[budget.categoryIcon] ? (
                (() => {
                  const Icon = CATEGORY_ICONS[budget.categoryIcon];
                  return <Icon className="size-5" />;
                })()
              ) : (
                <span
                  className="size-3 rounded-full"
                  style={{
                    backgroundColor: budget.color ?? 'var(--color-neutral-400)',
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-foreground truncate text-sm font-semibold">
                {budget.category}
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {periodLabel[budget.period] ?? budget.period}
                </Badge>
                <Badge
                  variant={status.variant}
                  className="px-1.5 py-0 text-[10px]"
                >
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <Menu>
            <MenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 shrink-0"
                />
              }
            >
              <MoreVertical className="size-4" />
            </MenuTrigger>
            <MenuPopup side="bottom" align="end">
              <MenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Edit Budget
              </MenuItem>
              <MenuItem onClick={handleToggle} disabled={isToggling}>
                {budget.isActive ? <Pause /> : <Play />}
                {budget.isActive ? 'Pause Budget' : 'Activate Budget'}
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                Delete Budget
              </MenuItem>
            </MenuPopup>
          </Menu>
        </div>

        {/* Meter */}
        <Meter value={cappedProgress} max={100}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel className="text-muted-foreground text-xs">
              <NumberFlowCurrency
                value={budget.spent}
                className="text-foreground font-semibold"
              />
              <span className="mx-1">/</span>
              <NumberFlowCurrency value={budget.limit} />
            </MeterLabel>
            <MeterValue className="text-xs font-medium tabular-nums">
              {() => `${Math.round(budget.progress)}%`}
            </MeterValue>
          </div>
          <MeterTrack className="h-2 rounded-full">
            <MeterIndicator
              className="rounded-full transition-all duration-700"
              style={{ backgroundColor: meterColor }}
            />
          </MeterTrack>
        </Meter>
      </CardFrame>

      {/* Dialogs — rendered outside card to avoid portal issues */}
      <EditBudgetDialog
        budget={budget}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteBudgetDialog
        budgetId={budget.id}
        categoryName={budget.category}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
