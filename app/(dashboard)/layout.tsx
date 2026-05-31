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
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="relative min-h-0 overflow-hidden shadow-sm ring ring-neutral-200 dark:ring-neutral-800">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <header className="border-border/10 sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-neutral-200/10 px-4 backdrop-blur-xl dark:bg-neutral-950/10">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger render={<SidebarTrigger className="-ml-1" />} />
                <TooltipPopup>
                  <KbdGroup className="text-neutral-500">
                    <Command className="size-3" />
                  </KbdGroup>
                </TooltipPopup>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="size-9" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            {children}
          </div>
        </div>
        <ProgressiveBlur
          position="bottom"
          className="pointer-events-none absolute bottom-0 z-10 w-full"
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
