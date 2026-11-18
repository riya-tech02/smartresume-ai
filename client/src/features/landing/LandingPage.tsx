import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { Hero } from './Hero.js';
import { Features } from './Features.js';
import { HowItWorks } from './HowItWorks.js';
import { TemplateShowcase } from './TemplateShowcase.js';
import { CtaBand } from './CtaBand.js';
import { Footer } from '../../components/layout/Footer.js';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <TemplateShowcase />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
