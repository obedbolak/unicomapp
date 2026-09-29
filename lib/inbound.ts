// lib/inbound.ts
//
// Shared guards for the public forms (contact, newsletter): a per-address
// limit and simple input checks. The limit lives in memory, which is right
// for one server; it resets on restart, and that's fine — it only has to
// stop a script hammering the form, not keep a permanent record.

const hits = new Map<string, number[]>();

/** True if `key` has made `max` or more requests in the last `windowMs`. */
export function limited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep the map from growing without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }
  return false;
}

export function ipOf(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export const isEmail = (v: string) =>
  v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export const clip = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);
