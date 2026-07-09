import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Target,
  Tags,
  Landmark,
} from 'lucide-react';
import type { SidebarItem } from '@/types/dashboard/navigationItems';

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Accounts',
    url: '/accounts',
    icon: Landmark,
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
  {
    title: 'Categories',
    url: '/categories',
    icon: Tags,
  },
];
