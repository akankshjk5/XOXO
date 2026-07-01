"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, MessageCircle, Check } from "lucide-react";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  packageId: string;
  title: string;
  url?: string;
}

export function ShareTrip({ packageId, title, url }: Props) {
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackEvent("share", { entityType: "package", entityId: packageId, meta: { channel: "copy" } });
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link. Please check permissions and try again.");
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

  const btnClass =
    "flex items-center gap-2 rounded-full border border-[#E0E0E0] px-3 py-2 text-sm hover:border-green-dark transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2";

  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        type="button"
        whileTap={reduced ? undefined : { scale: 0.96 }}
        transition={{ duration: DURATION.micro, ease: EASE_OUT }}
        onClick={shareNative}
        className={cn(btnClass, "px-4 font-medium")}
        aria-label="Share trip"
      >
        <Share2 className="h-4 w-4" aria-hidden /> Share
      </motion.button>
      <motion.button
        type="button"
        whileTap={reduced ? undefined : { scale: 0.96 }}
        onClick={() => openSocial("whatsapp", `https://wa.me/?text=${text}%20${encoded}`)}
        className={btnClass}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-green-600" aria-hidden /> WhatsApp
      </motion.button>
      <motion.button
        type="button"
        whileTap={reduced ? undefined : { scale: 0.96 }}
        onClick={() => openSocial("twitter", `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`)}
        className={btnClass}
        aria-label="Share on X"
      >
        X
      </motion.button>
      <motion.button
        type="button"
        whileTap={reduced ? undefined : { scale: 0.96 }}
        onClick={() =>
          openSocial("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encoded}`)
        }
        className={btnClass}
        aria-label="Share on Facebook"
      >
        Facebook
      </motion.button>
      <motion.button
        type="button"
        whileTap={reduced ? undefined : { scale: 0.96 }}
        onClick={copy}
        className={cn(btnClass, copied && "border-green-dark text-green-dark bg-green-dark/5")}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </motion.button>
    </div>
  );
}
