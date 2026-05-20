import Container from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="flex flex-col space-y-10 py-10">
      <header className="flex items-center">
        <Button
          variant="ghost"
          className="gap-2 p-2"
          render={<Link href="/" />}
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Button>
      </header>
      <main className="flex items-center justify-center">
        <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
      </main>
    </Container>
  );
}
