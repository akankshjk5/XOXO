import dynamic from "next/dynamic";
import { CinematicHero } from "@/components/cinematic/CinematicHero";
import { WhosComingSection } from "@/components/home/WhosComingSection";
import { HashtagTicker } from "@/components/home/HashtagTicker";
import { StoryBridge } from "@/components/home/StorySection";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { LoadingSkeleton } from "@/components/motion/LoadingSkeleton";

function SectionFallback() {
  return (
    <div className="container-x section">
      <LoadingSkeleton className="h-8 w-48 mb-6 rounded-lg" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

const RecentlyBookedSection = dynamic(
  () => import("@/components/home/RecentlyBookedSection").then((m) => m.RecentlyBookedSection),
  { loading: () => <SectionFallback /> }
);
const WhyChooseUs = dynamic(
  () => import("@/components/home/WhyChooseUs").then((m) => m.WhyChooseUs),
  { loading: () => <SectionFallback /> }
);
const HomeDestinationSections = dynamic(
  () => import("@/components/home/HomeDestinationSections").then((m) => m.HomeDestinationSections),
  { loading: () => <SectionFallback /> }
);
const PackagesByDuration = dynamic(
  () => import("@/components/home/PackagesByDuration").then((m) => m.PackagesByDuration),
  { loading: () => <SectionFallback /> }
);
const AIItineraryBanner = dynamic(
  () => import("@/components/home/AIItineraryBanner").then((m) => m.AIItineraryBanner),
  { loading: () => <SectionFallback /> }
);
const TravelMatchPreview = dynamic(
  () => import("@/components/home/TravelMatchPreview").then((m) => m.TravelMatchPreview),
  { loading: () => <SectionFallback /> }
);
const SocialTravelSection = dynamic(
  () => import("@/components/home/SocialTravelSection").then((m) => m.SocialTravelSection),
  { loading: () => <SectionFallback /> }
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection").then((m) => m.TestimonialsSection),
  { loading: () => <SectionFallback /> }
);
const PlanWithXOXO = dynamic(
  () => import("@/components/home/PlanWithXOXO").then((m) => m.PlanWithXOXO),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <CinematicHero />
      <WhosComingSection />
      <HashtagTicker />
      <StoryBridge label="Trusted by travellers" />
      <RevealOnScroll>
        <RecentlyBookedSection />
      </RevealOnScroll>
      <StoryBridge label="Why XOXO" />
      <RevealOnScroll delay={0.04}>
        <WhyChooseUs />
      </RevealOnScroll>
      <StoryBridge label="Explore the world" />
      <RevealOnScroll>
        <HomeDestinationSections />
      </RevealOnScroll>
      <RevealOnScroll>
        <PackagesByDuration />
      </RevealOnScroll>
      <StoryBridge label="Plan smarter" />
      <RevealOnScroll>
        <AIItineraryBanner />
      </RevealOnScroll>
      <RevealOnScroll>
        <TravelMatchPreview />
      </RevealOnScroll>
      <StoryBridge label="Travel together" />
      <RevealOnScroll>
        <SocialTravelSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <TestimonialsSection />
      </RevealOnScroll>
      <PlanWithXOXO />
    </>
  );
}
