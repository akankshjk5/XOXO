/** Shared design tokens — keep cards, buttons, and motion consistent. */
export const CARD_SURFACE =
  "rounded-2xl border border-[#EBEBEB] bg-white shadow-premium card-lift overflow-hidden";

export const CARD_IMAGE_WRAP = "relative aspect-[16/10] overflow-hidden";

export const CARD_DEST_ASPECT = "relative aspect-[3/4] overflow-hidden";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-green-neon px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(34,197,94,0.35)] transition-[background,transform,box-shadow] duration-200 ease-standard hover:bg-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#E0E0E0] bg-white px-6 py-2.5 text-sm font-semibold text-text-dark transition-[border-color,background] duration-200 ease-standard hover:border-green-dark hover:text-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2 disabled:opacity-50";

export const ICON_BTN =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-text-dark transition-colors duration-200 ease-standard hover:bg-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2";
