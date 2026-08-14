// components/dashboard/ui.tsx
// Small presentational building blocks shared by both dashboards.
// Uses the site's existing CSS variables so it matches the public pages.

import type { CSSProperties, ReactNode } from "react";

export const font = "var(--font-display)";

export const card: CSSProperties = {
  borderRadius: "1rem",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  padding: "1.5rem",
};

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "1.75rem",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: font,
            fontSize: "1.6rem",
            fontWeight: 900,
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: font,
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              margin: "0.35rem 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent = "var(--color-primary)",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div style={{ ...card, padding: "1.25rem" }}>
      <div
        style={{
          fontFamily: font,
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: "1.875rem",
          fontWeight: 900,
          color: accent,
          lineHeight: 1.2,
          marginTop: "0.35rem",
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: font,
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            marginTop: "0.2rem",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      {children}
    </div>
  );
}

const BADGE_COLORS: Record<string, string> = {
  // enrollment
  NEW: "#3b82f6",
  CONTACTED: "#8b5cf6",
  INTERVIEW: "#a855f7",
  ACCEPTED: "#06b6d4",
  PAID: "#22c55e",
  ENROLLED: "#22c55e",
  ACTIVE: "#22c55e",
  COMPLETED: "#64748b",
  REJECTED: "#ef4444",
  WITHDRAWN: "#ef4444",
  // project
  PLANNING: "#8b5cf6",
  IN_PROGRESS: "#3b82f6",
  REVIEW: "#fbbf24",
  DELIVERED: "#22c55e",
  MAINTENANCE: "#06b6d4",
  ON_HOLD: "#f59e0b",
  CANCELLED: "#ef4444",
  // payment / invoice
  PENDING: "#fbbf24",
  CONFIRMED: "#22c55e",
  FAILED: "#ef4444",
  REFUNDED: "#f59e0b",
  DRAFT: "#64748b",
  SENT: "#3b82f6",
  PARTIAL: "#fbbf24",
  OVERDUE: "#ef4444",
  VOID: "#64748b",
  // certificate
  VALID: "#22c55e",
  REVOKED: "#f59e0b",
  // task
  TODO: "#64748b",
  BLOCKED: "#ef4444",
  DONE: "#22c55e",
  // priority
  LOW: "#64748b",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
  // roles
  ADMIN: "#ff8c00",
  STAFF: "#3b82f6",
  INACTIVE: "#ef4444",
};

export function Badge({ value }: { value: string }) {
  const color = BADGE_COLORS[value] ?? "#64748b";
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: font,
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.04em",
        padding: "0.2rem 0.55rem",
        borderRadius: 999,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Table({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;

  if (!hasRows) {
    return (
      <div
        style={{
          ...card,
          textAlign: "center",
          fontFamily: font,
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          padding: "3rem 1.5rem",
        }}
      >
        {empty ?? "Nothing here yet."}
      </div>
    );
  }

  return (
    <div style={{ ...card, padding: 0, overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: font,
          fontSize: "0.8125rem",
          minWidth: 640,
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "0.85rem 1rem",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  borderBottom: "1px solid var(--color-border)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const td: CSSProperties = {
  padding: "0.85rem 1rem",
  borderBottom: "1px solid var(--color-border)",
  color: "var(--color-text)",
  verticalAlign: "middle",
};

export const tdMuted: CSSProperties = {
  ...td,
  color: "var(--color-text-muted)",
};

export function money(amount: number | string | null | undefined, currency = "XAF") {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  const label = currency === "XAF" ? "FCFA" : currency;
  return `${n.toLocaleString("en-US")} ${label}`;
}

export function shortDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
