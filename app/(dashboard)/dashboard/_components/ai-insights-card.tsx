import { CardFrame } from '@/components/ui/card';
import { SparklesIcon, Clock } from 'lucide-react';

export function AiInsightsCard() {
  return (
    <CardFrame className="relative flex h-full flex-col gap-4 overflow-hidden p-6">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-emerald-500" />
        <h3 className="font-advercase-regular text-lg text-emerald-400">
          AI insights
        </h3>
      </div>

      <div className="relative mt-2 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
          <Clock className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-emerald-400">
            Under Development
          </h4>
          <p className="text-muted-foreground mx-auto max-w-[250px] text-xs">
            We&apos;re building smart, personalized financial insights for you.
            Available soon!
          </p>
        </div>
      </div>
    </CardFrame>
  );
}
