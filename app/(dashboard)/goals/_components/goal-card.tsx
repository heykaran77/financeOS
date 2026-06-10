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
import { EditGoalDialog } from '@/components/common/quick-actions/edit-goal-dialog';
import { DeleteGoalDialog } from '@/components/common/quick-actions/delete-goal-dialog';
import { AddFundsDialog } from '@/components/common/quick-actions/add-funds-dialog';
import { toggleGoalStatus } from '@/actions/goal';
import type { GoalItem } from '@/lib/queries/goal.queries';
import type { BankAccountRow } from '@/lib/queries/account.queries';
import {
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Play,
  Pause,
  PlusCircle,
  Target,
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';

function getGoalStatusInfo(
  status: GoalItem['status'],
  progress: number,
): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
} {
  if (status === 'completed') return { label: 'Completed', variant: 'success' };
  if (status === 'paused') return { label: 'Paused', variant: 'secondary' };
  if (progress >= 100) return { label: 'Goal Reached!', variant: 'success' };
  return { label: 'In Progress', variant: 'default' };
}

export function GoalCard({
  goal,
  bankAccounts,
}: {
  goal: GoalItem;
  bankAccounts: BankAccountRow[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [isToggling, startToggle] = useTransition();

  const statusInfo = getGoalStatusInfo(goal.status, goal.progress);
  const isCompleted = goal.status === 'completed' || goal.progress >= 100;
  const isPaused = goal.status === 'paused';

  function handleToggleStatus(newStatus: GoalItem['status']) {
    startToggle(async () => {
      await toggleGoalStatus(goal.id, newStatus);
    });
  }

  return (
    <>
      <CardFrame
        className={`flex flex-col gap-4 p-5 transition-opacity ${isPaused || isCompleted ? 'opacity-70' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              {isCompleted ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Target className="size-5" />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="text-foreground mt-0.5 truncate leading-none font-semibold">
                {goal.name}
              </h3>
              {goal.description && (
                <p className="text-muted-foreground truncate text-xs">
                  {goal.description}
                </p>
              )}
              <div className="mt-1 flex items-center gap-1.5">
                <Badge
                  variant={statusInfo.variant}
                  className="h-4 px-1.5 py-0 text-[10px] leading-none"
                >
                  {statusInfo.label}
                </Badge>
                {goal.targetDate && goal.status === 'in_progress' && (
                  <span className="text-muted-foreground text-[10px] font-medium">
                    {isPast(goal.targetDate)
                      ? 'Overdue'
                      : formatDistanceToNow(goal.targetDate, {
                          addSuffix: true,
                        })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Menu>
            <MenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-mt-1 -mr-1 size-7 shrink-0"
                />
              }
            >
              <MoreVertical className="size-4" />
            </MenuTrigger>
            <MenuPopup side="bottom" align="end">
              {!isCompleted && (
                <MenuItem onClick={() => setAddFundsOpen(true)}>
                  <PlusCircle />
                  Add Funds
                </MenuItem>
              )}
              <MenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Edit Goal
              </MenuItem>
              {goal.status === 'in_progress' && (
                <>
                  <MenuItem
                    onClick={() => handleToggleStatus('paused')}
                    disabled={isToggling}
                  >
                    <Pause /> Pause Goal
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleToggleStatus('completed')}
                    disabled={isToggling}
                  >
                    <CheckCircle2 /> Mark Completed
                  </MenuItem>
                </>
              )}
              {goal.status === 'paused' && (
                <MenuItem
                  onClick={() => handleToggleStatus('in_progress')}
                  disabled={isToggling}
                >
                  <Play /> Resume Goal
                </MenuItem>
              )}
              <MenuSeparator />
              <MenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                Delete Goal
              </MenuItem>
            </MenuPopup>
          </Menu>
        </div>

        <Meter value={Math.min(goal.progress, 100)} max={100} className="mt-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <MeterLabel className="text-muted-foreground flex items-baseline gap-1 text-xs">
              <NumberFlowCurrency
                value={goal.current}
                className="text-foreground font-semibold"
              />
              <span>of</span>
              <NumberFlowCurrency value={goal.target} />
            </MeterLabel>
            <MeterValue className="text-foreground text-xs font-semibold tabular-nums">
              {() => `${Math.round(goal.progress)}%`}
            </MeterValue>
          </div>
          <MeterTrack className="bg-secondary h-2.5 overflow-hidden rounded-full">
            <MeterIndicator
              className={`rounded-full transition-all duration-1000 ease-out ${
                isCompleted ? 'bg-emerald-500' : 'bg-primary'
              }`}
            />
          </MeterTrack>
        </Meter>
      </CardFrame>

      <EditGoalDialog goal={goal} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteGoalDialog
        goalId={goal.id}
        goalName={goal.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <AddFundsDialog
        goal={goal}
        bankAccounts={bankAccounts}
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
      />
    </>
  );
}
