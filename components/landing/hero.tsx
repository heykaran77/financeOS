import Link from 'next/link';
import Logo from '../common/logo';
import { Button } from '../ui/button';
import CustomGradientBlinds from './customGradientBlinds';

export default function Hero() {
  return (
    <div className="mx-auto max-w-5xl">
      <CustomGradientBlinds />
      <div className="pointer-events-none relative flex flex-col items-center justify-center space-y-4 py-10 text-center md:space-y-6">
        <div>
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Logo className="size-8 text-neutral-200 md:size-10" />
            <h1 className="font-advercase-regular text-3xl tracking-tight text-neutral-200 drop-shadow-lg md:text-5xl">
              FinanceOS
            </h1>
          </div>
          <p className="max-w-2xl text-lg font-medium tracking-tight text-neutral-200 md:text-2xl">
            your no bullsh*t finance tracker
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-8 md:gap-12">
          <Button
            className="text-sm hover:bg-neutral-200/60 dark:bg-neutral-800 dark:hover:bg-neutral-800/60"
            variant={'outline'}
            render={<Link href={'#TODO'} />}
          >
            View Demo
          </Button>
          <Button
            className="text-sm"
            variant={'default'}
            render={<Link href={'/auth/sign-up'} />}
          >
            Try for free
          </Button>
        </div>
      </div>
    </div>
  );
}
