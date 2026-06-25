import Link from "next/link";
import { Users, MapPin, UsersRound, Compass } from "lucide-react";
import { SOCIAL_FEATURES } from "@/lib/mock-data";

const ICON_MAP = {
  Users,
  MapPin,
  UsersRound,
  Compass,
};

export function SocialHighlights() {
  return (
    <section className="py-12 sm:py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Travel Better Together
          </h2>
          <p className="mt-2 text-text-secondary max-w-xl mx-auto">
            Connect with fellow travellers, find your tribe, and explore the world as a community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SOCIAL_FEATURES.map((feature) => {
            const Icon = ICON_MAP[feature.icon as keyof typeof ICON_MAP] || Compass;
            return (
              <Link key={feature.href} href={feature.href}>
                <div className="group rounded-xl bg-white border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
