import { AppSidebar } from '@/components/common/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { KbdGroup } from '@/components/ui/kbd';
import { Command } from 'lucide-react';
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/common/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger render={<SidebarTrigger className="-ml-1" />} />
              <TooltipPopup>
                <KbdGroup className="text-neutral-500">
                  <Command className="size-3" />B
                </KbdGroup>
              </TooltipPopup>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="size-9" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
