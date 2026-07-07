import BentoCard from '../common/bento-card';
import Container from '../common/container';
import SectionHeading from '../common/SectionHeading';
import DollarSVG from '../pixel-perfect/DollarSVG';
import LogoBar from '../pixel-perfect/LogoBar';
import RouletteWheel from '../pixel-perfect/RouletteWheel';
import { DotPattern } from '../ui/dot-pattern';

export default function Features() {
  return (
    <Container className="mx-auto space-y-8 py-4 md:py-20">
      <SectionHeading
        className="text-left"
        heading="Your money finally organized."
        subHeading="Everything you need to manage money clearly without spreadsheets, clutter, or productivity theater."
      />
      <div className="grid grid-cols-1 gap-2 py-4 md:auto-rows-[160px] md:grid-cols-2">
        <BentoCard
          title="Track everything."
          description="Expenses, income, subscriptions, and savings organized in one clean system."
          className="flex h-full w-full flex-col justify-between md:row-span-3"
        >
          <DotPattern
            glow={true}
            className={
              'mask-[radial-gradient(300px_circle_at_center,white,transparent)]'
            }
          />
          <DollarSVG className="mx-auto size-72 text-center" />
        </BentoCard>
        <BentoCard
          title="Money, in motion."
          description="See your financial momentum clearly."
          className="flex h-full w-full flex-col justify-between md:row-span-2"
        >
          <DotPattern
            glow={true}
            className={
              'mask-[radial-gradient(300px_circle_at_center,white,transparent)]'
            }
          />
          <LogoBar className="mx-auto mask-b-to-100%" />
        </BentoCard>
        <BentoCard
          title="Built for clarity."
          description="Not Complexity."
          className="flex h-full w-full flex-row items-center justify-between md:row-span-1"
        >
          <DotPattern
            glow={true}
            className={
              'mask-[radial-gradient(300px_circle_at_center,white,transparent)]'
            }
          />
          <RouletteWheel className="size-44 shrink-0" />
        </BentoCard>
      </div>
    </Container>
  );
}
