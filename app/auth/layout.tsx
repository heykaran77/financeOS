import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center p-6 pt-0 md:p-10 md:pt-0">
      <Button
        variant="ghost"
        className="absolute top-5 left-5 gap-2 md:top-8 md:left-8"
      >
        <ArrowLeft className="size-4" />
        <Link href="/">Back to Home</Link>
      </Button>
      <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
    </div>
  );
}
