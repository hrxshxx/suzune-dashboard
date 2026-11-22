/** Formatting helpers. Metrics always render with tabular numerals. */

export const formatNumber = (n: number): string => n.toLocaleString('en-US');

export function formatDelta(delta: number | null): string | null {
  if (delta === null || delta === 0) return null;
  return `${delta > 0 ? '+' : ''}${formatNumber(delta)}`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s_.-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Up to three initials for a server tile, e.g. "Aurora SMP" → "AS". */
export function acronym(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3) || '?';
}

/** A stable, muted tile colour per server, readable in both themes. */
export function tintFor(id: string): string {
  const hues = [28, 200, 150, 330, 260, 90, 12, 180];
  const h = hues[Number(id.slice(-3)) % hues.length];
  return `color-mix(in srgb, hsl(${h} 45% 50%) 16%, var(--elevated))`;
}
