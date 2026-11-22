import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'neutral' | 'primary' | 'critical' | 'warning' | 'success' | 'info';

// Colour is never the only signal — callers pass an icon alongside the label.
const TONES: Record<BadgeTone, string> = {
  neutral: 'text-muted bg-elevated-2',
  primary: 'text-primary-text bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]',
  critical: 'text-critical-text bg-[color-mix(in_srgb,var(--critical)_12%,transparent)]',
  warning: 'text-warning-text bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]',
  success: 'text-success-text bg-[color-mix(in_srgb,var(--success)_12%,transparent)]',
  info: 'text-info-text bg-[color-mix(in_srgb,var(--info)_12%,transparent)]',
};

export function Badge({ tone = 'neutral', icon, dot, children, className }: {
  tone?: BadgeTone; icon?: ReactNode; dot?: boolean; children: ReactNode; className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-pill px-2',
        'text-xs font-medium tabular-nums',
        TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}
