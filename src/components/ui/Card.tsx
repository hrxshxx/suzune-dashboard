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
        'rounded-card border shadow-card',
        glass
          ? 'border-[color:var(--glass-border)] bg-[color:var(--glass)] backdrop-blur-xl'
          : 'border-border bg-surface',
        tone === 'critical' && 'border-critical/40 bg-critical/[0.06]',
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
    <div className="flex flex-wrap items-start gap-4 border-b border-border p-5">
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
