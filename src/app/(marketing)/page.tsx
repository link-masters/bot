import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { PricingPreviewSection } from "@/components/marketing/pricing-preview";
import { CTASection } from "@/components/marketing/cta-section";
import { StatsSection } from "@/components/marketing/stats-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingPreviewSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
