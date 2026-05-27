import Link from 'next/link';
import Logo from '../common/logo';
import { Button } from '../ui/button';
import CustomGradientBlinds from './customGradientBlinds';
import { Star } from 'lucide-react';
import { Backlight } from '../ui/backlight';
import Image from 'next/image';
import Container from '../common/container';

export default function Hero() {
  return (
    <div className="relative w-full mask-b-from-80%">
      <CustomGradientBlinds />
      <Container className="mx-auto pt-32">
        <div className="">
          <div className="pointer-events-none relative flex flex-col items-center justify-center space-y-4 text-center md:space-y-12">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <Logo className="size-8 text-emerald-400 md:size-10" />
                <h1 className="font-advercase-regular text-3xl tracking-tight text-neutral-200 drop-shadow-lg md:text-5xl">
                  FinanceOS
                </h1>
              </div>
              <p className="max-w-2xl text-lg font-medium tracking-tight text-neutral-200 md:text-2xl">
                your no bullsh*t finance tracker
              </p>
            </div>

            <div className="pointer-events-auto flex items-center gap-6 md:gap-8">
              <Button
                className="text-sm hover:bg-neutral-200/60 dark:bg-neutral-800 dark:hover:bg-neutral-800/60"
                variant={'outline'}
                render={<Link href={'/auth/sign-up'} />}
              >
                Try FinanceOS
              </Button>
              <Button
                className="text-sm"
                variant={'default'}
                render={
                  <Link href={'https://github.com/heykaran77/financeOS'} />
                }
              >
                <Star className="mr-2 size-4" />
                Star on Github
              </Button>
            </div>
            <div className="relative w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-950/50 p-1 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-lg border border-neutral-800">
                <Image
                  src="/assets/auth-image.webp"
                  alt="FinanceOS App Preview"
                  width={1920}
                  height={1080}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
