import React from 'react';
import { HeroSection } from './components/hero-section';
import { FeaturesGrid } from './components/features-grid';
import { SocialProofSection } from './components/social-proof-section';
import { HowItWorksSection } from './components/how-it-works-section';
import { PricingCtaBanner } from './components/pricing-cta-banner';

export function LandingPage() {
  return (
    <div className="flex flex-col w-full snap-y snap-mandatory scroll-smooth">
      <div className="w-full snap-start snap-always scroll-mt-16">
        <HeroSection />
      </div>
      <div className="w-full snap-start snap-always scroll-mt-16">
        <FeaturesGrid />
      </div>
      <div className="w-full snap-start snap-always scroll-mt-16">
        <SocialProofSection />
      </div>
      <div className="w-full snap-start snap-always scroll-mt-16">
        <HowItWorksSection />
      </div>
      <div className="w-full snap-start snap-always scroll-mt-16">
        <PricingCtaBanner />
      </div>
    </div>
  );
}
