import { Check, CheckCheck } from "lucide-react";

/** Sent → delivered (has id) → seen (isRead). */
export function MessageStatus({ sent, delivered, seen }: { sent?: boolean; delivered?: boolean; seen?: boolean }) {
  if (!sent) return null;
  if (seen) {
    return <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Seen" />;
  }
  if (delivered) {
    return <CheckCheck className="h-3.5 w-3.5 text-white/70" aria-label="Delivered" />;
  }
  return <Check className="h-3.5 w-3.5 text-white/70" aria-label="Sent" />;
}
