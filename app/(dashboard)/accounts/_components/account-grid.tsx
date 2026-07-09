'use client';

import { CardFrame } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Badge } from '@/components/ui/badge';
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ICONS,
  type AccountType,
} from '@/types/accountSchema';
import type { BankAccountRow } from '@/lib/queries/account.queries';
import { CATEGORY_ICONS } from '@/lib/icons';
import { Landmark, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { FlippableAccountCard } from '@/components/ui/flippable-account-card';
import { useState } from 'react';
import { Menu, MenuTrigger, MenuPopup, MenuItem } from '@/components/ui/menu';
import { EditAccountDialog } from '@/components/forms/editAccountDialog';
import { DeleteAccountDialog } from '@/components/common/quick-actions/delete-account-dialog';

// ─── Account Card ────────────────────────────────────────────────

function AccountCard({
  account,
  userName,
}: {
  account: BankAccountRow;
  userName: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const typeLabel =
    ACCOUNT_TYPE_LABELS[account.type as AccountType] || account.type;

  const balanceEl = (
    <AnimatedNumber
      value={Number(account.balance)}
      locales="en-IN"
      format={{
        style: 'currency',
        currency: account.currency || 'INR',
        maximumFractionDigits: 0,
      }}
    />
  );

  const iconEl = (() => {
    // First check if account has a custom icon that maps to Lucide, else use the default for type
    const iconKey =
      account.icon && CATEGORY_ICONS[account.icon]
        ? account.icon
        : ACCOUNT_TYPE_ICONS[account.type as AccountType] || 'Landmark';

    const Icon = CATEGORY_ICONS[iconKey];

    if (Icon) {
      return <Icon className="size-4" />;
    }

    // Fallback for old emoji string icons stored in DB
    if (account.icon) {
      return <span className="text-xl leading-none">{account.icon}</span>;
    }

    if (account.color) {
      return (
        <span
          className="size-3 rounded-full"
          style={{ backgroundColor: account.color }}
        />
      );
    }

    return <Landmark className="size-4" />;
  })();

  return (
    <div className="group/card relative flex justify-center p-2 perspective-distant">
      <FlippableAccountCard
        accountName={account.name}
        accountHolderName={userName}
        accountType={typeLabel}
        balanceElement={balanceEl}
        currency={account.currency || 'INR'}
        color={account.color || undefined}
        iconElement={iconEl}
      />

      {/* Options Menu */}
      <div className="absolute top-6 right-6 z-10 opacity-0 transition-opacity group-hover/card:opacity-100 focus-within:opacity-100">
        <Menu>
          <MenuTrigger
            render={
              <button
                className="flex size-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40 focus:ring-2 focus:ring-white/50 focus:outline-none"
                aria-label="Account options"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </MenuTrigger>
          <MenuPopup>
            <MenuItem onClick={() => setEditOpen(true)}>
              <Edit2 className="size-4" />
              Edit
            </MenuItem>
            <MenuItem onClick={() => setDeleteOpen(true)} variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </MenuItem>
          </MenuPopup>
        </Menu>
      </div>

      <EditAccountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        account={account}
      />
      <DeleteAccountDialog
        accountId={account.id}
        accountName={account.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}

// ─── Account Grid ────────────────────────────────────────────────

export function AccountGrid({
  accounts,
  userName,
}: {
  accounts: BankAccountRow[];
  userName: string;
}) {
  if (accounts.length === 0) {
    return (
      <CardFrame className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Landmark className="size-6" />
        </div>
        <p className="text-foreground text-sm font-medium">No accounts yet</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          Add your first bank account, wallet, or credit card to start tracking
          your finances.
        </p>
      </CardFrame>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} userName={userName} />
      ))}
    </div>
  );
}
