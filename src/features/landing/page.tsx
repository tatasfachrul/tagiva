import React from 'react';
import { HeroSection } from './components/hero-section';
import { FeaturesGrid } from './components/features-grid';
import { TemplateShowcase } from './components/template-showcase';
import { LandingFaq } from './components/landing-faq';

export function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <FeaturesGrid />
      <TemplateShowcase />
      <LandingFaq />
    </div>
  );
}
