"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

const EMOJIS = ["😀", "😂", "❤️", "👍", "🎉", "✈️", "🌴", "🔥", "🙏", "😊", "🤩", "💯"];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
}

export function EmojiPicker({ onPick }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0 self-end mb-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="touch-target rounded-full text-text-grey hover:text-green-dark min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Insert emoji"
        aria-expanded={open}
      >
        <Smile className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-30 w-[min(16rem,calc(100vw-3rem))] grid grid-cols-6 gap-1 rounded-2xl border border-[#EBEBEB] bg-white p-2.5 shadow-elevated">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="text-lg hover:scale-110 transition-transform p-1.5 rounded-lg hover:bg-off-white min-h-[36px]"
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
