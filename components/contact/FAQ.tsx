const FAQ_ITEMS = [
  {
    q: "How do I book a package?",
    a: "Choose a package, sign in, select travellers and dates, then pay securely via Razorpay.",
  },
  {
    q: "Are flights included?",
    a: "Package prices cover the itinerary shown. We suggest flights via partners — book separately through affiliate links.",
  },
  {
    q: "Can I customize my trip?",
    a: "Yes! Use our AI Concierge or Smart Trip Planner on any package page to regenerate your itinerary.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellation terms vary by package. Contact support or check your booking confirmation for details.",
  },
  {
    q: "Do you help with visas?",
    a: "Yes — use our Visa Assistant or submit an inquiry. We'll guide you through requirements.",
  },
];

export function FAQ() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-dark mb-4">Frequently asked questions</h2>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-[#EBEBEB] bg-white px-4 py-3 open:shadow-sm"
          >
            <summary className="cursor-pointer font-medium text-text-dark list-none flex justify-between items-center">
              {item.q}
              <span className="text-green-dark group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-2 text-sm text-text-grey leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-sm text-text-grey">
        Prefer phone? Call{" "}
        <a href="tel:+919240204872" className="font-semibold text-green-dark hover:underline">
          +91 92402 04872
        </a>
      </p>
    </div>
  );
}
