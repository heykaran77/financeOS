import { cn } from '@/lib/utils';

interface BentoCardProps {
  className?: string;
  title: string;
  description: string;
}

export default function BentoCard({
  className,
  title,
  description,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'boder-neutral-200 flex flex-col justify-end rounded-xl border bg-neutral-800 p-6 dark:border-neutral-800 dark:bg-neutral-900',
        className,
      )}
    >
      <h3 className="text-lg font-bold text-neutral-100">{title}</h3>
      <p className="mt-1 text-sm text-neutral-400">{description}</p>
    </div>
  );
}
