import { CardFrame } from '@/components/ui/card';
import { SparklesIcon } from 'lucide-react';

export function AiInsightsCard() {
  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-emerald-500" />
        <h3 className="font-advercase-regular text-lg text-emerald-400">
          AI insights
        </h3>
      </div>

      <div className="text-foreground/80 mt-2 flex flex-col gap-4 text-sm">
        <p>
          &quot;You spent <span className="font-medium">18% more</span> on Food
          this month.&quot;
        </p>
        <p>
          &quot;Swiggy accounts for <span className="font-medium">42%</span> of
          your dining expenses.&quot;
        </p>
        <p>
          &quot;Your highest spending day was{' '}
          <span className="font-medium">May 24</span>.&quot;
        </p>
      </div>
    </CardFrame>
  );
}
