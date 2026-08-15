// components/dashboard/Charts.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export type Point = { label: string; value: number };

const ACCENT = "#ff8c00";
const ACCENT_SOFT = "#ffb300";
const GRID = "rgba(255,255,255,0.07)";
const INK_DIM = "rgba(255,255,255,0.34)";

/* ── shared helpers ──────────────────────────────────────────────────────── */

/**
 * Axis that lands on round numbers: pick a nice step first, then the top of
 * the scale is step × count. Avoids ticks like 6.25 on a count of people.
 */
function axis(maxValue: number, count = 4) {
  if (maxValue <= 0) {
    return { max: count, ticks: Array.from({ length: count + 1 }, (_, i) => i) };
  }
  const raw = maxValue / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const nice = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => norm <= s)!;
  const step = nice * mag;
  return {
    max: step * count,
    ticks: Array.from({ length: count + 1 }, (_, i) => i * step),
  };
}

/**
 * The SVG is drawn in real pixels — the viewBox tracks the measured width —
 * so 10px axis text stays 10px on a phone instead of scaling down to 4px.
 */
function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
}

function fmt(n: number, compact = false) {
  if (compact && Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M`;
  if (compact && Math.abs(n) >= 1_000) return `${Math.round(n / 1000)}K`;
  return n.toLocaleString("en-US");
}

/** Catmull-Rom → cubic bezier, so the curve passes through every point. */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function Tooltip({
  x,
  label,
  value,
  suffix,
}: {
  x: number;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div
      className="dash-tip"
      style={{ left: `${x}%`, top: 0 }}
      role="status"
      aria-live="polite"
    >
      <span className="dash-tip-label">{label}</span>
      <span className="dash-tip-value">{value}</span>
      {suffix && (
        <span style={{ color: INK_DIM }}> {suffix}</span>
      )}
    </div>
  );
}

/* ── Area chart — a single series over time ──────────────────────────────── */

export function AreaChart({
  data,
  unit = "",
  height = 230,
  id = "area",
}: {
  data: Point[];
  unit?: string;
  height?: number;
  id?: string;
}) {
  const [wrap, W] = useWidth(720);
  const [hover, setHover] = useState<number | null>(null);

  const H = height;
  const padL = 40;
  const padR = 16;
  const padT = 14;
  const padB = 26;

  const scale = axis(Math.max(...data.map((d) => d.value), 0));
  const max = scale.max;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  // drop labels until they fit — ~34px of room each
  const every = Math.max(1, Math.ceil((data.length * 34) / Math.max(innerW, 1)));

  const px = (i: number) =>
    padL + (data.length === 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
  const py = (v: number) => padT + innerH - (innerH * v) / max;

  const pts = data.map((d, i) => ({ x: px(i), y: py(d.value) }));
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;

  const last = data[data.length - 1];

  function onMove(e: React.MouseEvent) {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    const ratio = (e.clientX - box.left) / box.width;
    const svgX = ratio * W;
    let best = 0;
    let bestD = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - svgX);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHover(best);
  }

  const active = hover === null ? null : data[hover];

  return (
    <div
      className="dash-chart"
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {active && hover !== null && (
        <Tooltip
          x={(pts[hover].x / W) * 100}
          label={active.label}
          value={fmt(active.value)}
          suffix={unit}
        />
      )}

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Trend over time">
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ACCENT_SOFT} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
        </defs>

        {/* gridlines + y ticks */}
        {scale.ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={py(t)}
              y2={py(t)}
              stroke={GRID}
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={py(t) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill={INK_DIM}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(t, true)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${id}-fill)`} />
        <path
          d={line}
          fill="none"
          stroke={`url(#${id}-line)`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* x labels — thinned until they fit, so they never collide */}
        {data.map((d, i) =>
          i % every === 0 ? (
            <text
              key={d.label + i}
              x={px(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill={INK_DIM}
            >
              {d.label}
            </text>
          ) : null,
        )}

        {/* crosshair */}
        {hover !== null && (
          <line
            x1={pts[hover].x}
            x2={pts[hover].x}
            y1={padT}
            y2={padT + innerH}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
        )}

        {/* endpoint marker — 2px surface ring keeps it legible over the line */}
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r="4.5"
          fill={ACCENT}
          stroke="#050d1c"
          strokeWidth="2"
        />
        {hover !== null && hover !== data.length - 1 && (
          <circle
            cx={pts[hover].x}
            cy={pts[hover].y}
            r="4.5"
            fill={ACCENT}
            stroke="#050d1c"
            strokeWidth="2"
          />
        )}

        {/* one direct label, on the endpoint only */}
        <text
          x={pts[pts.length - 1].x}
          y={pts[pts.length - 1].y - 12}
          textAnchor="end"
          fontSize="11"
          fontWeight="700"
          fill="rgba(255,255,255,0.82)"
        >
          {fmt(last.value)}
        </text>
      </svg>
    </div>
  );
}

/* ── Column chart — magnitude by period ──────────────────────────────────── */

export function BarChart({
  data,
  unit = "",
  height = 230,
}: {
  data: Point[];
  unit?: string;
  height?: number;
}) {
  const [wrap, W] = useWidth(560);
  const [hover, setHover] = useState<number | null>(null);

  const H = height;
  const padL = 42;
  const padR = 10;
  const padT = 14;
  const padB = 26;

  const scale = axis(Math.max(...data.map((d) => d.value), 0));
  const max = scale.max;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const band = innerW / data.length;
  // cap thickness, always leave at least a 2px gap between neighbours
  const barW = Math.max(3, Math.min(24, band - 8));
  const r = 4;
  const every = Math.max(1, Math.ceil((data.length * 34) / Math.max(innerW, 1)));

  const py = (v: number) => padT + innerH - (innerH * v) / max;

  function barPath(x: number, y: number, w: number, h: number) {
    if (h <= 0.5) return "";
    const rr = Math.min(r, h);
    // rounded top, square at the baseline
    return `M ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} Z`;
  }

  const active = hover === null ? null : data[hover];

  return (
    <div className="dash-chart" ref={wrap}>
      {active && hover !== null && (
        <Tooltip
          x={((padL + band * hover + band / 2) / W) * 100}
          label={active.label}
          value={fmt(active.value)}
          suffix={unit}
        />
      )}

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Amount by period">
        <defs>
          <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT_SOFT} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {scale.ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={py(t)}
              y2={py(t)}
              stroke={GRID}
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={py(t) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill={INK_DIM}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(t, true)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = padL + band * i + (band - barW) / 2;
          const y = py(d.value);
          const h = padT + innerH - y;
          return (
            <g
              key={d.label + i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* generous hit target, bigger than the mark */}
              <rect
                x={padL + band * i}
                y={padT}
                width={band}
                height={innerH}
                fill="transparent"
              />
              <path
                d={barPath(x, y, barW, h)}
                fill="url(#bar-fill)"
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
              {i % every === 0 && (
                <text
                  x={padL + band * i + band / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill={INK_DIM}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Meter — one ratio against a limit ───────────────────────────────────── */

export function Meter({
  value,
  caption,
  min = "0%",
  max = "100%",
}: {
  value: number; // 0–100
  caption: string;
  min?: string;
  max?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const R = 78;
  const CX = 100;
  const CY = 92;
  const circ = Math.PI * R; // half circle

  return (
    <div className="dash-meter">
      <svg viewBox="0 0 200 110" width="100%" style={{ maxWidth: 260 }}>
        <defs>
          <linearGradient id="meter-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ACCENT_SOFT} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
        </defs>

        {/* track — a lighter step of the same ramp */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="rgba(255,140,0,0.16)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="url(#meter-fill)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
        />
      </svg>

      <div style={{ marginTop: "-2.1rem" }}>
        <div className="dash-meter-value">{Math.round(pct)}%</div>
        <div className="dash-meter-caption">{caption}</div>
      </div>

      <div className="dash-meter-scale">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
