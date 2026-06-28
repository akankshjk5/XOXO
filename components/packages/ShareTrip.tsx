"use client";

import { Share2, Copy, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";

interface Props {
  packageId: string;
  title: string;
  url?: string;
}

export function ShareTrip({ packageId, title, url }: Props) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackEvent("share", { entityType: "package", entityId: packageId, meta: { channel: "copy" } });
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Check out ${title} on XOXO Travels`, url: shareUrl });
        trackEvent("share", { entityType: "package", entityId: packageId, meta: { channel: "native" } });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  const openSocial = (channel: string, href: string) => {
    trackEvent("share", { entityType: "package", entityId: packageId, meta: { channel } });
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const encoded = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(`Check out ${title} on XOXO Travels!`);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={shareNative}
        className="flex items-center gap-2 rounded-full border border-[#E0E0E0] px-4 py-2 text-sm font-medium hover:border-green-dark transition-colors"
        aria-label="Share trip"
      >
        <Share2 className="h-4 w-4" aria-hidden /> Share
      </button>
      <button
        type="button"
        onClick={() => openSocial("whatsapp", `https://wa.me/?text=${text}%20${encoded}`)}
        className="flex items-center gap-2 rounded-full border border-[#E0E0E0] px-3 py-2 text-sm hover:border-green-500"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-green-600" aria-hidden /> WhatsApp
      </button>
      <button
        type="button"
        onClick={() => openSocial("twitter", `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`)}
        className="rounded-full border border-[#E0E0E0] px-3 py-2 text-sm hover:border-green-dark"
        aria-label="Share on X"
      >
        X
      </button>
      <button
        type="button"
        onClick={() =>
          openSocial("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encoded}`)
        }
        className="rounded-full border border-[#E0E0E0] px-3 py-2 text-sm hover:border-green-dark"
        aria-label="Share on Facebook"
      >
        Facebook
      </button>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-2 rounded-full border border-[#E0E0E0] px-3 py-2 text-sm hover:border-green-dark"
        aria-label="Copy link"
      >
        <Copy className="h-4 w-4" aria-hidden /> Copy
      </button>
    </div>
  );
}
