"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { contactAPI } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { FAQ } from "@/components/contact/FAQ";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(form);
      trackEvent("contact", { entityType: "page", meta: { subject: form.subject } });
      toast.success("Message sent! We'll reply within 24 hours.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Couldn't send message. Try again or call us.");
    } finally {
      setLoading(false);
    }
  };

  const ticket = async () => {
    if (!form.name || !form.email || !form.message) {
      toast.error("Fill name, email & message to open a ticket.");
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

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#EBEBEB] bg-white p-6">
        <h2 className="text-xl font-semibold text-text-dark">Send us a message</h2>
        {(["name", "email", "phone", "subject"] as const).map((field) => (
          <label key={field} className="block text-sm">
            <span className="capitalize text-text-grey">{field}</span>
            <input
              type={field === "email" ? "email" : "text"}
              required={field === "name" || field === "email"}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2.5"
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="text-text-grey">Message</span>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2.5"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-green-dark px-6 py-3 font-bold text-white hover:bg-green-mid disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send message"}
          </button>
          <button
            type="button"
            onClick={ticket}
            disabled={loading}
            className="rounded-full border border-green-dark px-6 py-3 font-semibold text-green-dark hover:bg-green-dark/5"
          >
            Open support ticket
          </button>
        </div>
      </form>
      <FAQ />
    </div>
  );
}
