'use client';

import Features from '@/components/landing/features';
import Footer from '@/components/landing/footer';
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
      <Features />
      <Footer />
    </div>
  );
}
