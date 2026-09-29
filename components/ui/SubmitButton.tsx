"use client";

// components/ui/SubmitButton.tsx
// Drop-in replacement for a submit <button> inside a form that calls a server
// action. While the action runs it:
//   • disables itself (no double submits),
//   • shows a spinner next to the label,
//   • optionally swaps the label (pendingText, e.g. "Saving…").
// It reads the state of its parent form with React's useFormStatus, so the
// page that renders it can stay a server component.

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Label shown while the form is submitting. Defaults to the normal label. */
  pendingText?: ReactNode;
};

export default function SubmitButton({
  children,
  pendingText,
  disabled,
  className,
  ...rest
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      {...rest}
      className={className}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
    >
      {pending && <Spinner />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/** Small spinning ring that inherits the button's text colour. */
export function Spinner({
  size = 14,
  iconOnly = false,
}: {
  size?: number;
  /** Set when the spinner replaces an icon (no text next to it). */
  iconOnly?: boolean;
}) {
  return (
    <svg
      className={iconOnly ? "btn-spinner btn-spinner--icon" : "btn-spinner"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
