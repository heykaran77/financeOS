import { AppSidebar } from '@/components/common/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { KbdGroup } from '@/components/ui/kbd';
import { Command, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip';
import { GlobalSearch } from '@/components/common/global-search';
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
            <div className="flex flex-1 items-center gap-2">
              <Tooltip>
                <TooltipTrigger render={<SidebarTrigger className="-ml-1" />} />
                <TooltipPopup>
                  <KbdGroup className="text-neutral-500">
                    <Command className="size-3" />B
                  </KbdGroup>
                </TooltipPopup>
              </Tooltip>
            </div>

            <div className="flex w-full max-w-[280px] items-center justify-center px-4">
              <GlobalSearch />
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
              <Button
                size="sm"
                className="border-transparent bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                <Plus className="mr-1 -ml-1 size-4" />
                <span className="hidden sm:inline">New transaction</span>
              </Button>
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
