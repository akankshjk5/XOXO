import { STATS } from "@/lib/mock-data";

export function StatsRow() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Why Choose XOXO Travels?
          </h2>
          <p className="mt-2 text-text-secondary max-w-xl mx-auto">
            More than just bookings — a complete travel ecosystem built for modern Indian explorers
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl bg-white border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "🤖",
              title: "AI-Powered Planning",
              desc: "Let Claude AI craft personalized day-by-day itineraries tailored to your style and budget.",
            },
            {
              icon: "👥",
              title: "Social Travel",
              desc: "Find travel buddies, join group trips, and connect with locals through our community features.",
            },
            {
              icon: "🔒",
              title: "Digital Travel Locker",
              desc: "Securely store passports, visas, tickets, and insurance — all in one encrypted vault.",
            },
            {
              icon: "💳",
              title: "Easy Payments",
              desc: "Pay seamlessly via UPI, cards, or wallets with Razorpay. Earn reward points on every booking.",
            },
            {
              icon: "🗺️",
              title: "Local Guides",
              desc: "Book verified local guides for authentic, off-the-beaten-path experiences.",
            },
            {
              icon: "📞",
              title: "24/7 Support",
              desc: "Round-the-clock travel assistance via chat, call, or our AI travel expert.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-white p-6 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="text-3xl mb-3 block">{feature.icon}</span>
              <h3 className="font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
