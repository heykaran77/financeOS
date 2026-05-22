import Logo from '../common/logo';
import CustomGradientBlinds from './customGradientBlinds';

export default function Hero() {
  return (
    <div className="mx-auto max-w-5xl">
      <CustomGradientBlinds />
      <div className="pointer-events-none relative flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center gap-4">
          <Logo className="size-10 text-neutral-200" />
          <h1 className="font-advercase-regular text-4xl tracking-tight text-neutral-200 drop-shadow-lg md:text-5xl">
            FinanceOS
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-2xl font-medium tracking-tight text-neutral-200">
          your no bullsh*t finance tracker
        </p>
      </div>
    </div>
  );
}
