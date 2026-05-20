import { LayoutDashboard, ReceiptText } from 'lucide-react';
import type { SidebarItem } from '@/types/dashboard/navigationItems';

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    url: '/transactions',
    icon: ReceiptText,
  },
];
