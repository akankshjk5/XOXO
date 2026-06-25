"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-white p-8 sm:p-12 text-center shadow-card">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Get Travel Deals in Your Inbox
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Subscribe for exclusive offers, destination guides, and travel tips — no spam, we promise.
          </p>

          {submitted ? (
            <p className="text-success font-medium">
              🎉 You&apos;re subscribed! Check your inbox for a welcome offer.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-11"
                />
              </div>
              <Button type="submit" className="h-11 px-6 shrink-0">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
