'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, CreditCard } from 'lucide-react';
import { sidebarItems } from '@/config/navigationItemsConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logout from '@/components/common/logout';
import { ThemeToggle } from '@/components/common/theme-toggle';
import Logo from './logo';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/menu';
import { SidebarQuickActions } from '@/components/common/sidebar-quick-actions';

function SidebarFooterSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <SidebarMenu>
        <SidebarMenuItem>
          <Skeleton className="h-8 w-full group-data-[collapsible=icon]:size-8" />
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-sidebar-border/40 border-b p-4 group-data-[collapsible=icon]:p-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2"
        >
          <Logo className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-advercase-regular text-md text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            FinanceOS
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              <SidebarMenuItem className="px-1 group-data-[collapsible=icon]:px-0">
                <SidebarQuickActions />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="cursor-pointer py-1"
                    onMouseEnter={() => setHovered(item.title)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className="relative overflow-visible hover:bg-transparent"
                    >
                      {hovered === item.title && (
                        <motion.div
                          layoutId="sidebar-hover"
                          className="absolute inset-0 z-0 h-full w-full rounded-lg bg-emerald-500/10 ring ring-emerald-500/20 dark:bg-emerald-700/40 dark:ring-emerald-800/30"
                          transition={{
                            duration: 0.3,
                          }}
                        ></motion.div>
                      )}
                      <div className="relative z-10 flex items-center gap-2">
                        <item.icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border/40 border-t p-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
        {isPending ? (
          <SidebarFooterSkeleton />
        ) : user ? (
          <SidebarMenu className="gap-4">
            <SidebarMenuItem>
              <Menu>
                <MenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                    />
                  }
                >
                  <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-sm font-semibold text-white dark:bg-emerald-500">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="user"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sidebar-foreground truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <span className="text-sidebar-foreground/60 truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </MenuTrigger>
                <MenuPopup
                  align="start"
                  side="right"
                  sideOffset={4}
                  className="w-56"
                >
                  <MenuGroup>
                    <MenuGroupLabel>Account</MenuGroupLabel>
                    <MenuItem>
                      <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                      Profile
                    </MenuItem>
                    <MenuItem>
                      <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
                      Billing
                    </MenuItem>
                  </MenuGroup>
                </MenuPopup>
              </Menu>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex gap-2">
              <Logout
                variant="default"
                className="flex flex-1 justify-center gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
              >
                <LogOut className="size-4 shrink-0 text-emerald-600 dark:text-emerald-800" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Logout
                </span>
              </Logout>
              <div className="group-data-[collapsible=icon]:hidden">
                <ThemeToggle className="size-9 shrink-0" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
