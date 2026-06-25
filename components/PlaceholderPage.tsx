import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page — XOXO Travels",
};

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text-primary mb-4">{title}</h1>
      <p className="text-text-secondary">
        {description || "This page is coming soon. Check back shortly!"}
      </p>
    </div>
  );
}
