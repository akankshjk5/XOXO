import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SOCIAL_FEATURES } from "@/lib/social-features";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";

export function SocialTravelSection() {
  return (
    <section className="section-compact bg-white">
      <div className="container-x">
        <FadeIn className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Travel is Better with People
          </h2>
          <p className="text-text-secondary mt-2 max-w-lg mx-auto text-sm sm:text-base">
            Plan smarter, move easier, and explore with trusted local experts
          </p>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-5">
          {SOCIAL_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.href}>
                <Link href={feature.href} className="group block h-full">
                  <article className="card-premium p-6 h-full hover-lift flex flex-col ring-1 ring-transparent group-hover:ring-green-bright/20 transition-all duration-300">
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 text-white"
                      style={{ background: feature.gradient }}
                    >
                      <Icon className="h-7 w-7" aria-hidden />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-navy transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-4">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </article>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
