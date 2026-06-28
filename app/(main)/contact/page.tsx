import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact & Support | XOXO Travels",
  description: "Get in touch with XOXO Travels — bookings, support, and travel questions.",
};

export default function ContactPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-28 pb-20">
      <h1 className="text-3xl font-bold text-text-dark mb-2">Contact & Support</h1>
      <p className="text-text-grey mb-10 max-w-xl">
        Questions about bookings, visas, or custom trips? We&apos;re here to help.
      </p>
      <ContactForm />
    </div>
  );
}
