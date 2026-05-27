import { cn } from '@/lib/utils';

interface BentoCardProps {
  className?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function BentoCard({
  className,
  title,
  description,
  children,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border bg-neutral-950 p-6 ring ring-neutral-800',
        className,
      )}
    >
      {children}
      <div className="flex flex-col gap-2">
        <h3 className="font-advercase-regular text-lg tracking-tight text-neutral-100 md:text-2xl">
          {title}
        </h3>
        <p className="text-sm leading-tight tracking-tight text-neutral-700 md:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
