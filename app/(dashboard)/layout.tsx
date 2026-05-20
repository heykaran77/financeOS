import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/common/app-sidebar';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Command, CommandIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipPopup,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <Tooltip>
            <TooltipTrigger>
              <SidebarTrigger className="-ml-1" />
            </TooltipTrigger>
            <TooltipPopup>
              <KbdGroup className="text-neutral-500">
                <Command className="size-3" />B
              </KbdGroup>
            </TooltipPopup>
          </Tooltip>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
