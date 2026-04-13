export default function Container({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div className={`container mx-auto max-w-7xl px-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
