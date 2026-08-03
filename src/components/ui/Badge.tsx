import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'neutral' | 'primary' | 'critical' | 'warning' | 'success' | 'info';

// Colour is never the only signal — callers pass an icon alongside the label.
const TONES: Record<BadgeTone, string> = {
  neutral: 'text-muted bg-elevated border-border',
  primary: 'text-primary-text bg-primary/10 border-primary/30',
  critical: 'text-critical-text bg-critical/10 border-critical/30',
  warning: 'text-warning-text bg-warning/10 border-warning/30',
  success: 'text-success-text bg-success/10 border-success/30',
  info: 'text-info-text bg-info/10 border-info/30',
};

export function Badge({ tone = 'neutral', icon, children, className }: {
  tone?: BadgeTone; icon?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1',
        'text-xs font-semibold tabular-nums',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
