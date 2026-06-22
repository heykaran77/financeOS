'use client';

import { PlusIcon, TargetIcon, WalletIcon, TagIcon } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { AddTransactionDialog } from '@/components/forms/addTransactionDialog';
import { CreateCategoryDialog } from '@/components/common/quick-actions/create-category-dialog';
import { CreateGoalDialog } from '@/components/common/quick-actions/create-goal-dialog';
import { CreateBudgetDialog } from '@/components/common/quick-actions/create-budget-dialog';

// Each action is rendered with a sidebar-native trigger button so it
// participates in the sidebar's collapsed/icon state properly.

const TRIGGER_CLASS =
  'w-full justify-start gap-2 text-sm font-normal text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer';

export function SidebarQuickActions() {
  return (
    <div className="flex flex-col gap-0.5">
      {/* ── Add Transaction ─────────────────────── */}
      <AddTransactionDialog
        withTrigger
        trigger={
          <SidebarMenuButton
            tooltip="Add Transaction"
            className={TRIGGER_CLASS}
          >
            <PlusIcon className="size-5 shrink-0 text-emerald-500" />
            <span className="group-data-[collapsible=icon]:hidden">
              Add Transaction
            </span>
          </SidebarMenuButton>
        }
      />

      {/* ── Create Goal ─────────────────────────── */}
      <CreateGoalDialog
        withTrigger
        trigger={
          <SidebarMenuButton tooltip="New Goal" className={TRIGGER_CLASS}>
            <TargetIcon className="size-5 shrink-0 text-blue-500" />
            <span className="group-data-[collapsible=icon]:hidden">
              New Goal
            </span>
          </SidebarMenuButton>
        }
      />

      {/* ── Create Budget ────────────────────────── */}
      <CreateBudgetDialog
        withTrigger
        trigger={
          <SidebarMenuButton tooltip="New Budget" className={TRIGGER_CLASS}>
            <WalletIcon className="size-5 shrink-0 text-amber-500" />
            <span className="group-data-[collapsible=icon]:hidden">
              New Budget
            </span>
          </SidebarMenuButton>
        }
      />

      {/* ── Create Category ──────────────────────── */}
      <CreateCategoryDialog
        withTrigger
        trigger={
          <SidebarMenuButton tooltip="New Category" className={TRIGGER_CLASS}>
            <TagIcon className="size-5 shrink-0 text-purple-500" />
            <span className="group-data-[collapsible=icon]:hidden">
              New Category
            </span>
          </SidebarMenuButton>
        }
      />
    </div>
  );
}
