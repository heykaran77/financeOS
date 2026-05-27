interface SectionHeadingProps {
  className?: string;
  heading: string;
  subHeading?: string;
}

export default function SectionHeading({
  className,
  heading,
  subHeading,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-advercase-regular text-2xl tracking-tight text-emerald-400 md:text-3xl">
        {heading}
      </h1>
      <p className="text-xs font-medium tracking-tight text-neutral-700 md:text-lg">
        {subHeading}
      </p>
    </div>
  );
}
