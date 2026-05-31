import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Target,
  LineChart,
  Settings,
} from 'lucide-react';
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
  {
    title: 'Analytics',
    url: '/analytics',
    icon: LineChart,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];
