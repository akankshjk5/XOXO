"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJIS = ["😀", "😂", "❤️", "👍", "🎉", "✈️", "🌴", "🔥", "🙏", "😊", "🤩", "💯"];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
}

export function EmojiPicker({ onPick }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
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
        <div className="absolute bottom-full left-0 mb-2 z-20 grid grid-cols-6 gap-1 rounded-2xl border border-[#EBEBEB] bg-white p-2 shadow-lg">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="text-lg hover:scale-110 transition-transform p-1 rounded-lg hover:bg-off-white"
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
