import React from 'react';
import { accessElf } from '../../auth/utils/accessElf';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AboutUsSection from './components/AboutUsSection';
import ServicesSection from './components/ServicesSection';
import ContactUsSection from './components/ContactUsSection';
import PricingSection from './components/PricingSection';

function LandingPage() {
  accessElf.track('LandingPage');

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <AboutUsSection />
      <ServicesSection />
      <ContactUsSection />
    </div>
  );
}

export default LandingPage;
