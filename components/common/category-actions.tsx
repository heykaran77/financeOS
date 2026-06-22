'use client';

import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { EditCategoryDialog } from '@/components/common/quick-actions/edit-category-dialog';
import { DeleteCategoryDialog } from '@/components/common/quick-actions/delete-category-dialog';

interface CategoryActionsProps {
  category: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Edit Category
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
          >
            Delete Category
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryDialog
        category={{
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
        }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteCategoryDialog
        categoryId={category.id}
        categoryName={category.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
