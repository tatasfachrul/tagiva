import React from 'react';
import { HeroSection } from './components/hero-section';
import { FeaturesGrid } from './components/features-grid';
import { SocialProofSection } from './components/social-proof-section';
import { HowItWorksSection } from './components/how-it-works-section';
import { PricingCtaBanner } from './components/pricing-cta-banner';

export function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <FeaturesGrid />
      <SocialProofSection />
      <HowItWorksSection />
      <PricingCtaBanner />
    </div>
  );
}
