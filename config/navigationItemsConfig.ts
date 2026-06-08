import { LayoutDashboard, ReceiptText, Wallet, Target } from 'lucide-react';
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
  {
    title: 'Budgets',
    url: '/budgets',
    icon: Wallet,
  },
  {
    title: 'Goals',
    url: '/goals',
    icon: Target,
  },
];
