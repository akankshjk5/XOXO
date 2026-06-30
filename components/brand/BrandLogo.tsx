import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand";

type BrandLogoVariant = "navbar" | "footer" | "auth" | "intro" | "admin";

const VARIANT_CLASS: Record<BrandLogoVariant, string> = {
  /** Mobile 40px, desktop 48px */
  navbar: "h-10 w-auto md:h-12",
  footer: "h-10 w-auto sm:h-11",
  auth: "h-11 w-auto",
  intro: "h-20 w-auto sm:h-24 md:h-28",
  admin: "h-9 w-auto",
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
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={BRAND_LOGO_ALT}>
      {img}
    </Link>
  );
}
