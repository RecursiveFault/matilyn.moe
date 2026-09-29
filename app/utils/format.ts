// Auto-imported everywhere in app/ by Nuxt.

// 2006-style date: 2026.09.29. Uses UTC so the build server (UTC in CI) and the
// visitor's browser render the same text, which keeps hydration consistent.
export function ymd(value?: string | number | Date | null): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.replaceAll("-", ".");
  const d = value ? new Date(value) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
}

// Backloggd-style rating, 0–5 in halves: 3.5 -> ★★★½☆
export function stars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
