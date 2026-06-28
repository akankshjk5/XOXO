import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SOCIAL_FEATURES } from "@/lib/social-features";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";

export function SocialTravelSection() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <FadeIn className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Travel is Better with People
          </h2>
          <p className="text-text-secondary mt-2 max-w-lg mx-auto">
            Connect with fellow travellers, find your tribe, and explore the world as a community
          </p>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {SOCIAL_FEATURES.map((feature) => (
            <StaggerItem key={feature.href}>
              <Link href={feature.href} className="group block h-full">
                <article className="card-premium p-6 h-full hover-lift flex flex-col ring-1 ring-transparent group-hover:ring-green-bright/20 transition-all duration-300">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: feature.gradient }}
                  >
                    {feature.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-navy transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-4">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:gap-2 transition-all">
                    Try Now <ArrowRight className="h-4 w-4" />
                  </span>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
