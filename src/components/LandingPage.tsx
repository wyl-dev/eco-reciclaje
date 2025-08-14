

import Header from "./landing/Header";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import BenefitsSection from "./landing/BenefitsSection";
import CallToActionSection from "./landing/CallToActionSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <CallToActionSection />
    </div>
  );
}
