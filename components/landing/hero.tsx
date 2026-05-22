import Logo from '../common/logo';
import CustomGradientBlinds from './customGradientBlinds';

export default function Hero() {
  return (
    <div className="mx-auto max-w-5xl">
      <CustomGradientBlinds />
      <div className="pointer-events-none relative flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex items-center justify-center gap-4">
          <Logo className="size-12 text-emerald-400 mix-blend-multiply" />
          <h1 className="font-advercase-regular text-4xl tracking-tight text-white drop-shadow-lg md:text-6xl">
            FinanceOS
          </h1>
        </div>
        <p className="text-md mt-4 max-w-2xl text-neutral-200">
          Manage your money with clarity and confidence.
        </p>
      </div>
    </div>
  );
}
