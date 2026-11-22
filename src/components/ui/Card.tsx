import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section';
  /** Glass is reserved for focal surfaces — 2-4 per page, never everything. */
  glass?: boolean;
  tone?: 'default' | 'critical';
}

export function Card({ as = 'div', glass, tone = 'default', className, children, ...rest }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'min-w-0 rounded-card border',
        glass
          ? 'border-[color:var(--glass-border)] bg-[color:var(--glass)] shadow-modal backdrop-blur-[18px] backdrop-saturate-[1.2]'
          : 'border-border bg-surface',
        tone === 'critical' && 'border-transparent bg-[color-mix(in_srgb,var(--critical)_12%,transparent)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action }: {
  title: ReactNode; description?: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-faint">{description}</p>}
      </div>
      {action}
    </div>
  );
}
