import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand";

type BrandLogoVariant = "navbar" | "footer" | "auth" | "intro" | "admin";

const VARIANT_CLASS: Record<BrandLogoVariant, string> = {
  /** Mobile 36px, desktop 44px — capped width to avoid horizontal overflow */
  navbar: "h-9 max-h-9 w-auto max-w-[112px] md:h-11 md:max-h-11 md:max-w-[140px]",
  footer: "h-9 w-auto max-w-[128px] sm:h-10 sm:max-w-[140px]",
  auth: "h-10 w-auto max-w-[140px]",
  intro: "h-16 w-auto max-w-[200px] sm:h-20 sm:max-w-[240px] md:h-24 md:max-w-[280px]",
  admin: "h-8 w-auto max-w-[100px]",
};

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  linked?: boolean;
  href?: string;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = "navbar",
  linked = true,
  href = "/",
  className,
  priority = false,
}: BrandLogoProps) {
  const img = (
    <Image
      src={BRAND_LOGO_SRC}
      alt={BRAND_LOGO_ALT}
      width={512}
      height={160}
      priority={priority}
      className={cn("object-contain object-left", VARIANT_CLASS[variant], className)}
    />
  );

  if (!linked) return img;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center p-0 leading-none" aria-label={BRAND_LOGO_ALT}>
      {img}
    </Link>
  );
}
