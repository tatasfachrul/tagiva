import React from 'react';
import { HeroSection } from './components/hero-section';
import { InteractiveTeaser } from './components/interactive-teaser';
import { FeaturesGrid } from './components/features-grid';
import { TemplateShowcase } from './components/template-showcase';
import { LandingFaq } from './components/landing-faq';

export function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <InteractiveTeaser />
      <FeaturesGrid />
      <TemplateShowcase />
      <LandingFaq />
    </div>
  );
}
