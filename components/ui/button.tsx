"use client";

import { motion, HTMLMotionProps, TargetAndTransition } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

/* ============================================================================
   TYPES
   ============================================================================ */

type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

/* ============================================================================
   STYLE MAPS
   ============================================================================ */

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #FFB300 0%, #FF8C00 100%)",
    color: "#000814",
    boxShadow: "0 4px 20px rgba(255,140,0,0.25)",
    border: "none",
  },
  ghost: {
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "none",
  },
  outline: {
    background: "transparent",
    color: "#FF8C00",
    border: "1px solid rgba(255,140,0,0.5)",
    boxShadow: "none",
  },
  danger: {
    background: "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 4px 20px rgba(255,0,0,0.2)",
  },
};

const variantHover: Record<ButtonVariant, TargetAndTransition> = {
  primary: {
    y: -3,
    boxShadow: "0 10px 30px rgba(255,140,0,0.4)",
  },
  ghost: {
    y: -2,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  outline: {
    y: -2,
    boxShadow: "0 6px 20px rgba(255,140,0,0.2)",
    borderColor: "rgba(255,140,0,0.9)",
  },
  danger: {
    y: -2,
    boxShadow: "0 8px 24px rgba(255,0,0,0.35)",
  },
};

const sizeStyles: Record<
  ButtonSize,
  { padding: string; fontSize: string; gap: string; iconSize: number }
> = {
  sm: { padding: "8px 18px", fontSize: "12px", gap: "6px", iconSize: 14 },
  md: { padding: "12px 28px", fontSize: "14px", gap: "8px", iconSize: 16 },
  lg: { padding: "16px 36px", fontSize: "16px", gap: "10px", iconSize: 18 },
};

/* ============================================================================
   COMPONENT
   ============================================================================ */

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sz = sizeStyles[size];
  const vStyle = variantStyles[variant];
  const vHover = variantHover[variant];

  return (
    <motion.button
      whileHover={isDisabled ? {} : vHover}
      whileTap={isDisabled ? {} : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={isDisabled}
      style={{
        /* layout */
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sz.gap,
        width: fullWidth ? "100%" : "auto",

        /* shape */
        padding: sz.padding,
        borderRadius: "10px",
        cursor: isDisabled ? "not-allowed" : "pointer",

        /* type */
        fontSize: sz.fontSize,
        fontWeight: 700,
        fontFamily: "'Poppins', system-ui, sans-serif",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",

        /* variant */
        ...vStyle,

        /* disabled wash */
        opacity: isDisabled ? 0.45 : 1,

        /* transitions */
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: "background 0.2s, border-color 0.2s, opacity 0.2s",

        /* caller overrides */
        ...style,
      }}
      {...props}
    >
      {/* Left icon / spinner */}
      {loading ? (
        <Loader2
          size={sz.iconSize}
          style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
        />
      ) : (
        icon &&
        iconPosition === "left" && (
          <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
        )
      )}

      {/* Label */}
      <span>{children}</span>

      {/* Right icon */}
      {!loading && icon && iconPosition === "right" && (
        <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      )}

      {/* Inline keyframes for spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.button>
  );
}

export default Button;
