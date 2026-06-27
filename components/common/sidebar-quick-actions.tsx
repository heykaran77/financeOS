'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { PlusIcon, TargetIcon, WalletIcon, TagIcon } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { AddTransactionDialog } from '@/components/forms/addTransactionDialog';
import { CreateCategoryDialog } from '@/components/common/quick-actions/create-category-dialog';
import { CreateGoalDialog } from '@/components/common/quick-actions/create-goal-dialog';
import { CreateBudgetDialog } from '@/components/common/quick-actions/create-budget-dialog';

// Each action is rendered with a sidebar-native trigger button so it
// participates in the sidebar's collapsed/icon state properly.

const TRIGGER_CLASS =
  'relative overflow-visible hover:bg-transparent w-full justify-start gap-2 text-sm font-normal text-sidebar-foreground/80 hover:text-sidebar-foreground cursor-pointer';

export function SidebarQuickActions() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-0">
      {/* ── Add Transaction ─────────────────────── */}
      <div
        className="cursor-pointer py-1"
        onMouseEnter={() => setHovered('Add Transaction')}
        onMouseLeave={() => setHovered(null)}
      >
        <AddTransactionDialog
          withTrigger
          trigger={
            <SidebarMenuButton
              tooltip="Add Transaction"
              className={TRIGGER_CLASS}
            >
              {hovered === 'Add Transaction' && (
                <motion.div
                  layoutId="sidebar-hover"
                  className="absolute inset-0 z-0 h-full w-full rounded-lg bg-emerald-500/10 ring ring-emerald-500/20 dark:bg-emerald-700/40 dark:ring-emerald-800/30"
                  transition={{
                    duration: 0.3,
                  }}
                ></motion.div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                <PlusIcon className="size-5 shrink-0 text-emerald-500" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Add Transaction
                </span>
              </div>
            </SidebarMenuButton>
          }
        />
      </div>

      {/* ── Create Goal ─────────────────────────── */}
      <div
        className="cursor-pointer py-1"
        onMouseEnter={() => setHovered('New Goal')}
        onMouseLeave={() => setHovered(null)}
      >
        <CreateGoalDialog
          withTrigger
          trigger={
            <SidebarMenuButton tooltip="New Goal" className={TRIGGER_CLASS}>
              {hovered === 'New Goal' && (
                <motion.div
                  layoutId="sidebar-hover"
                  className="absolute inset-0 z-0 h-full w-full rounded-lg bg-emerald-500/10 ring ring-emerald-500/20 dark:bg-emerald-700/40 dark:ring-emerald-800/30"
                  transition={{
                    duration: 0.3,
                  }}
                ></motion.div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                <TargetIcon className="size-5 shrink-0 text-blue-500" />
                <span className="group-data-[collapsible=icon]:hidden">
                  New Goal
                </span>
              </div>
            </SidebarMenuButton>
          }
        />
      </div>

      {/* ── Create Budget ────────────────────────── */}
      <div
        className="cursor-pointer py-1"
        onMouseEnter={() => setHovered('New Budget')}
        onMouseLeave={() => setHovered(null)}
      >
        <CreateBudgetDialog
          withTrigger
          trigger={
            <SidebarMenuButton tooltip="New Budget" className={TRIGGER_CLASS}>
              {hovered === 'New Budget' && (
                <motion.div
                  layoutId="sidebar-hover"
                  className="absolute inset-0 z-0 h-full w-full rounded-lg bg-emerald-500/10 ring ring-emerald-500/20 dark:bg-emerald-700/40 dark:ring-emerald-800/30"
                  transition={{
                    duration: 0.3,
                  }}
                ></motion.div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                <WalletIcon className="size-5 shrink-0 text-amber-500" />
                <span className="group-data-[collapsible=icon]:hidden">
                  New Budget
                </span>
              </div>
            </SidebarMenuButton>
          }
        />
      </div>

      {/* ── Create Category ──────────────────────── */}
      <div
        className="cursor-pointer py-1"
        onMouseEnter={() => setHovered('New Category')}
        onMouseLeave={() => setHovered(null)}
      >
        <CreateCategoryDialog
          withTrigger
          trigger={
            <SidebarMenuButton tooltip="New Category" className={TRIGGER_CLASS}>
              {hovered === 'New Category' && (
                <motion.div
                  layoutId="sidebar-hover"
                  className="absolute inset-0 z-0 h-full w-full rounded-lg bg-emerald-500/10 ring ring-emerald-500/20 dark:bg-emerald-700/40 dark:ring-emerald-800/30"
                  transition={{
                    duration: 0.3,
                  }}
                ></motion.div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                <TagIcon className="size-5 shrink-0 text-purple-500" />
                <span className="group-data-[collapsible=icon]:hidden">
                  New Category
                </span>
              </div>
            </SidebarMenuButton>
          }
        />
      </div>
    </div>
  );
}
