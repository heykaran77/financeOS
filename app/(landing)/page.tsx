'use client';

import Container from '@/components/common/container';
import Logo from '@/components/common/logo';
import CustomGradientBlinds from '@/components/landing/customGradientBlinds';
import Hero from '@/components/landing/hero';

export default function Main() {
  return (
    <div className="relative min-h-screen">
      <Container className="pt-24 md:pt-32">
        <Hero />
      </Container>
    </div>
  );
}
