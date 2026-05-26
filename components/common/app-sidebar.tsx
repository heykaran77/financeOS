'use client';

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
  SidebarRail,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { sidebarItems } from '@/config/navigationItemsConfig';
import Logout from '@/components/common/logout';
import Logo from './logo';

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="border-sidebar-border/40 border-b p-4 group-data-[collapsible=icon]:p-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2"
        >
          <Logo className="text-sidebar-primary size-5 shrink-0" />
          <span className="font-advercase-regular text-md text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            FinanceOS
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                    >
                      <item.icon className="size-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border/40 border-t p-4 group-data-[collapsible=icon]:p-2">
        {user && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sidebar-foreground truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="text-sidebar-foreground/60 truncate text-xs">
                  {user.email}
                </span>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Logout
                  variant="default"
                  className="w-full items-center justify-center gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
                >
                  <LogOut className="size-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                  </span>
                </Logout>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
