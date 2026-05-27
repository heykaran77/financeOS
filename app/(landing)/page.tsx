'use client';

import Container from '@/components/common/container';
import Logo from '@/components/common/logo';
import CustomGradientBlinds from '@/components/landing/customGradientBlinds';
import Features from '@/components/landing/features';
import Hero from '@/components/landing/hero';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

export default function Main() {
  return (
    <div className="relative min-h-screen bg-black">
      <ProgressiveBlur
        position="bottom"
        className="pointer-events-none fixed z-50"
      />
      <Hero />
      <Container className="pt-12 pb-24">
        <Features />
      </Container>
    </div>
  );
}
