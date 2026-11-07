import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "eyebrow inline-flex items-center justify-center gap-3 px-7 py-4 min-h-[3.25rem] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

export const ctaVariants = {
  solid: "bg-charcoal text-ivory hover:bg-ink",
  outline:
    "border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-ivory",
  light: "bg-ivory text-charcoal hover:bg-cream",
  ghostLight: "border border-ivory/35 text-ivory hover:bg-ivory hover:text-charcoal",
} as const;

type Variant = keyof typeof ctaVariants;

export function CtaLink({
  to,
  search,
  variant = "solid",
  className,
  children,
}: {
  to: string;
  search?: Record<string, unknown>;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} search={search as never} className={cn(base, ctaVariants[variant], className)}>
      {children}
    </Link>
  );
}

export function CtaAnchor({
  href,
  variant = "outline",
  className,
  children,
  external = true,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(base, ctaVariants[variant], className)}
    >
      {children}
    </a>
  );
}

export function CtaButton({
  onClick,
  variant = "solid",
  className,
  disabled,
  children,
  type = "button",
}: {
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        base,
        ctaVariants[variant],
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}
