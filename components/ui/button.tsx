"use client";

import { useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  /** Visual style */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Pill / rounded-full shape (default: true) */
  pill?: boolean;
  /** Adds a subtle magnetic hover pull effect */
  magnetic?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Shows a spinner and disables interaction */
  loading?: boolean;
  /** Icon placed before the label */
  iconLeft?: React.ReactNode;
  /** Icon placed after the label */
  iconRight?: React.ReactNode;
  /** Full-width block button */
  fullWidth?: boolean;
  /** HTML button type */
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  /** Extra Tailwind classes for one-off overrides */
  className?: string;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#1A4FA0] to-[#4CB8E0] text-white border-transparent " +
    "shadow-[0_8px_32px_rgba(26,79,160,0.45)] hover:shadow-[0_12px_40px_rgba(26,79,160,0.65)]",
  outline:
    "bg-white/[0.06] text-white border border-[#4CB8E0]/50 backdrop-blur-lg " +
    "hover:bg-[#4CB8E0]/10 hover:border-[#4CB8E0]/80",
  ghost:
    "bg-transparent text-[#4CB8E0] border border-transparent " +
    "hover:bg-[#4CB8E0]/10",
  danger:
    "bg-gradient-to-br from-[#C93B2A] to-[#e05c4a] text-white border-transparent " +
    "shadow-[0_8px_28px_rgba(201,59,42,0.4)] hover:shadow-[0_12px_36px_rgba(201,59,42,0.6)]",
};

const SIZE_STYLES: Record<ButtonSize, { btn: string; spinner: string }> = {
  sm: { btn: "px-5 py-2 text-xs gap-1.5", spinner: "w-3 h-3 border" },
  md: { btn: "px-8 py-3 text-sm gap-2", spinner: "w-4 h-4 border-2" },
  lg: { btn: "px-12 py-4 text-base gap-2.5", spinner: "w-5 h-5 border-2" },
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`${className} rounded-full border-white/30 border-t-white animate-spin inline-block`}
    />
  );
}

// ─── Core button (no magnetic wrapper) ───────────────────────────────────────

function CoreButton({
  variant = "primary",
  size = "md",
  pill = true,
  disabled,
  loading,
  iconLeft,
  iconRight,
  fullWidth,
  type = "button",
  onClick,
  children,
  className = "",
}: Omit<ButtonProps, "magnetic">) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={isDisabled ? undefined : { scale: 1.05 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={[
        // base
        "relative inline-flex items-center justify-center font-bold tracking-wide",
        "transition-all duration-200 select-none outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#4CB8E0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B2E]",
        // shape
        pill ? "rounded-full" : "rounded-xl",
        // variant + size
        VARIANT_STYLES[variant],
        SIZE_STYLES[size].btn,
        // state
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer",
        fullWidth ? "w-full" : "",
        // font
        "font-[Clash_Display,DM_Sans,sans-serif]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ fontFamily: "'Clash Display','DM Sans',sans-serif" }}
    >
      {loading && <Spinner className={SIZE_STYLES[size].spinner} />}
      {!loading && iconLeft && <span className="shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * `<Button>` — reusable across all pages.
 *
 * @example
 * // Primary CTA
 * <Button variant="primary" size="lg" iconRight="✦">Start a Project</Button>
 *
 * // Outline (ghost-bordered)
 * <Button variant="outline" onClick={handleClick}>See Our Work →</Button>
 *
 * // Danger with loading state
 * <Button variant="danger" loading={isPending}>Delete</Button>
 *
 * // Magnetic pull on hover (hero sections)
 * <Button magnetic>Hover me</Button>
 */
export default function Button({ magnetic = false, ...props }: ButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - r.left - r.width / 2) * 0.35);
      y.set((e.clientY - r.top - r.height / 2) * 0.35);
    },
    [x, y],
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (!magnetic) return <CoreButton {...props} />;

  return (
    <motion.div
      style={{
        x: sx,
        y: sy,
        display: props.fullWidth ? "block" : "inline-block",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <CoreButton {...props} />
    </motion.div>
  );
}
