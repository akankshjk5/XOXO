"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { contactAPI } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { FAQ } from "@/components/contact/FAQ";
import { getPhoneValidationError, isValidPhoneNumber } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneError = phoneTouched ? getPhoneValidationError(form.phone) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    const phoneErr = getPhoneValidationError(form.phone);
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }
    setLoading(true);
    try {
      await contactAPI.submit(form);
      trackEvent("contact", { entityType: "page", meta: { subject: form.subject } });
      toast.success("Message sent! We'll reply within 24 hours.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setPhoneTouched(false);
    } catch {
      toast.error("Couldn't send message. Try again or call us.");
    } finally {
      setLoading(false);
    }
  };

  const ticket = async () => {
    setPhoneTouched(true);
    if (!form.name || !form.email || !form.message) {
      toast.error("Fill name, email & message to open a ticket.");
      return;
    }
    const phoneErr = getPhoneValidationError(form.phone);
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }
    setLoading(true);
    try {
      await contactAPI.createTicket({
        name: form.name,
        email: form.email,
        subject: form.subject || "Support request",
        description: form.message,
        category: "other",
      });
      toast.success("Support ticket created!");
    } catch {
      toast.error("Couldn't create ticket.");
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    name: "Name",
    email: "Email",
    phone: "Phone number",
    subject: "Subject",
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-premium">
        <h2 className="text-xl font-semibold text-text-dark">Send us a message</h2>
        {(["name", "email", "phone", "subject"] as const).map((field) => (
          <label key={field} className="block text-sm">
            <span className="text-text-grey">
              {fieldLabels[field]}
              {(field === "name" || field === "email" || field === "phone") && (
                <span className="text-red-500 ml-0.5" aria-hidden>*</span>
              )}
            </span>
            <input
              type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              required={field === "name" || field === "email" || field === "phone"}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              onBlur={field === "phone" ? () => setPhoneTouched(true) : undefined}
              aria-invalid={field === "phone" && !!phoneError}
              aria-describedby={field === "phone" && phoneError ? "contact-phone-error" : undefined}
              placeholder={field === "phone" ? "+91 98765 43210" : undefined}
              className={cn(
                "mt-1 w-full rounded-xl border px-3 py-2.5 min-h-[44px] focus:outline-none",
                field === "phone" && phoneError
                  ? "border-red-300 focus:border-red-400"
                  : "border-[#EBEBEB] focus:border-green-dark"
              )}
            />
            {field === "phone" && phoneError && (
              <p id="contact-phone-error" className="mt-1 text-xs text-red-600" role="alert">
                {phoneError}
              </p>
            )}
            {field === "phone" && !phoneError && (
              <p className="mt-1 text-[11px] text-text-grey">
                Required — so our travel expert can reach you.
              </p>
            )}
          </label>
        ))}
        <label className="block text-sm">
          <span className="text-text-grey">Message</span>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2.5 focus:border-green-dark focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || !isValidPhoneNumber(form.phone)}
            className="rounded-full bg-green-dark px-6 py-3 font-bold text-white hover:bg-green-mid disabled:opacity-60 min-h-[44px]"
          >
            {loading ? "Sending…" : "Send message"}
          </button>
          <button
            type="button"
            onClick={ticket}
            disabled={loading || !isValidPhoneNumber(form.phone)}
            className="rounded-full border border-green-dark px-6 py-3 font-semibold text-green-dark hover:bg-green-dark/5 disabled:opacity-60 min-h-[44px]"
          >
            Open support ticket
          </button>
        </div>
      </form>
      <FAQ />
    </div>
  );
}
