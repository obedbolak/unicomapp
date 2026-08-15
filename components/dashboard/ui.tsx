// components/dashboard/ui.tsx
// Presentational building blocks. Styling lives in dashboard.css so the JSX
// stays readable; every colour resolves from app/globals.css tokens.

import type { CSSProperties, ReactNode } from "react";

export const font = "var(--font-display)";

/** Kept for compatibility with earlier pages that spread `card` inline. */
export const card: CSSProperties = {
  borderRadius: "20px",
  background:
    "linear-gradient(127deg, rgba(13,27,46,0.38) 20%, rgba(5,10,23,0.46) 100%)",
  border: "1px solid rgba(255,255,255,0.09)",
  padding: "1.35rem",
  backdropFilter: "blur(26px) saturate(135%)",
};

export function Card({
  title,
  subtitle,
  action,
  flush,
  children,
  className = "",
  style,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  flush?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={`dash-card ${flush ? "dash-card--flush" : ""} ${className}`}
      style={style}
    >
      {(title || action) && (
        <div
          className="dash-card-head"
          style={flush ? { padding: "1.35rem 1.35rem 0" } : undefined}
        >
          <div>
            {title && <h2 className="dash-card-title">{title}</h2>}
            {subtitle && <p className="dash-card-sub">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

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
        marginBottom: "1.25rem",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--dash-ink-muted)",
              margin: "0.3rem 0 0",
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

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="dash-kpis">{children}</div>;
}

/**
 * Stat tile: label · value · optional delta · optional hint · optional icon.
 * `deltaGood` says whether a positive delta is a good thing (default: yes).
 */
export function StatTile({
  label,
  value,
  hint,
  delta,
  deltaGood = true,
  deltaPeriod = "vs last month",
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: number | null;
  deltaGood?: boolean;
  deltaPeriod?: string;
  icon?: ReactNode;
  accent?: string;
}) {
  const up = (delta ?? 0) >= 0;
  const good = up === deltaGood;

  return (
    <div className="dash-card dash-stat">
      <div style={{ minWidth: 0 }}>
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value" style={accent ? { color: accent } : undefined}>
          {value}
          {delta !== undefined && delta !== null && (
            <span
              className="dash-stat-delta"
              style={{ color: good ? "#22c55e" : "#f87171" }}
              title={`${up ? "+" : ""}${delta}% ${deltaPeriod}`}
            >
              {up ? "+" : ""}
              {delta}%
            </span>
          )}
        </p>
        {hint && <p className="dash-stat-hint">{hint}</p>}
      </div>
      {icon && <span className="dash-tile">{icon}</span>}
    </div>
  );
}

/* ── Status colours ──────────────────────────────────────────────────────── */

const BADGE_COLORS: Record<string, string> = {
  // enrollment
  NEW: "#3b82f6",
  CONTACTED: "#8b5cf6",
  INTERVIEW: "#a855f7",
  ACCEPTED: "#06b6d4",
  PAID: "#22c55e",
  ENROLLED: "#22c55e",
  ACTIVE: "#22c55e",
  COMPLETED: "#94a3b8",
  REJECTED: "#f87171",
  WITHDRAWN: "#f87171",
  // project
  PLANNING: "#8b5cf6",
  IN_PROGRESS: "#3b82f6",
  REVIEW: "#fbbf24",
  DELIVERED: "#22c55e",
  MAINTENANCE: "#06b6d4",
  ON_HOLD: "#f59e0b",
  CANCELLED: "#f87171",
  // payment / invoice
  PENDING: "#fbbf24",
  CONFIRMED: "#22c55e",
  FAILED: "#f87171",
  REFUNDED: "#f59e0b",
  DRAFT: "#94a3b8",
  SENT: "#3b82f6",
  PARTIAL: "#fbbf24",
  OVERDUE: "#f87171",
  VOID: "#94a3b8",
  // certificate
  VALID: "#22c55e",
  REVOKED: "#f59e0b",
  // contact message / lead
  READ: "#8b5cf6",
  REPLIED: "#22c55e",
  ARCHIVED: "#94a3b8",
  // task
  TODO: "#94a3b8",
  BLOCKED: "#f87171",
  DONE: "#22c55e",
  // priority
  LOW: "#94a3b8",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#f87171",
  // roles
  ADMIN: "#ff8c00",
  STAFF: "#3b82f6",
  // Violet, deliberately unlike ADMIN's orange — equity is not access, and the
  // two should never be mistaken for each other at a glance.
  PARTNER: "#a855f7",
  INACTIVE: "#f87171",
};

export function Badge({ value }: { value: string }) {
  const color = BADGE_COLORS[value] ?? "#94a3b8";
  return (
    <span
      className="dash-badge"
      style={{
        background: `${color}1f`,
        border: `1px solid ${color}59`,
        color,
      }}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

/* ── Table ───────────────────────────────────────────────────────────────── */

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
    return <div className="dash-empty">{empty ?? "Nothing here yet."}</div>;
  }

  return (
    <div className="dash-tablewrap">
      <table className="dash-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Legacy inline-style exports, now no-ops that defer to the CSS classes. */
export const td: CSSProperties = {};
export const tdMuted: CSSProperties = { color: "var(--dash-ink-muted)" };

/* ── Progress rows ───────────────────────────────────────────────────────── */

export function ProgressRows({
  rows,
}: {
  rows: { label: string; value: number; display?: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="dash-rows">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="dash-row-top">
            <span className="dash-row-name">{r.label}</span>
            <span className="dash-row-val">{r.display ?? r.value}</span>
          </div>
          <div className="dash-track">
            <div
              className="dash-fill"
              style={{ width: `${Math.round((r.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Formatters ──────────────────────────────────────────────────────────── */

export function money(
  amount: number | string | null | undefined,
  currency = "XAF",
) {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  const label = currency === "XAF" ? "FCFA" : currency;
  return `${n.toLocaleString("en-US")} ${label}`;
}

/** Money short enough for a stat tile: 545K FCFA · 3.4M FCFA */
export function moneyCompact(
  amount: number | string | null | undefined,
  currency = "XAF",
) {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  const label = currency === "XAF" ? "FCFA" : currency;
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M ${label}`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1000)}K ${label}`;
  return `${n.toLocaleString("en-US")} ${label}`;
}

/** Compact form for stat tiles: 1,284 · 12.9K · 4.2M */
export function compact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

export function shortDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Percentage change from `prev` to `now`, rounded. Null when there's no base. */
export function pctChange(now: number, prev: number): number | null {
  if (!prev) return now > 0 ? 100 : null;
  return Math.round(((now - prev) / prev) * 100);
}
