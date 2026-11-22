import { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { relativeTime } from '../../lib/format';
import type { SecurityEvent } from '../../api/types';

const DOT: Record<SecurityEvent['outcomeTone'], string> = {
  critical: 'text-critical-text',
  warning: 'text-warning-text',
  success: 'text-success-text',
  muted: 'text-faint',
};

type Filter = 'all' | 'Active' | 'Resolved';
const FILTERS: [Filter, string][] = [['all', 'All'], ['Active', 'Active'], ['Resolved', 'Resolved']];

const rowCls = 'grid grid-cols-1 gap-1.5 border-t border-border px-4 py-3 transition-colors duration-fast hover:bg-hover lg:grid-cols-[96px_112px_minmax(0,1fr)_88px] lg:gap-4';

function Header({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 border-b border-border px-4 py-1.5">
      <h2 id="inc-h" className="font-semibold">Recent incidents</h2>
      <span className="flex-1" />
      {children}
    </div>
  );
}

export function EventsSkeleton() {
  return (
    <section className="rounded-card border border-border bg-surface">
      <Header />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-border px-4 py-2.5">
          <Skeleton className="h-2.5 w-20" /><Skeleton className="h-3 flex-1" /><Skeleton className="h-2.5 w-28" />
        </div>
      ))}
    </section>
  );
}

/** Anti-Nuke triggers and moderation cases, newest first. */
export function EventsList({ events }: { events: SecurityEvent[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = events.filter((e) => filter === 'all' || e.outcome === filter);

  return (
    <section aria-labelledby="inc-h" className="rounded-card border border-border bg-surface">
      <Header>
        <div role="group" aria-label="Filter incidents" className="inline-flex gap-0.5 rounded-ctrl border border-border-strong bg-surface p-0.5">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded px-2 text-xs transition-colors duration-fast',
                filter === key ? 'bg-elevated-2 text-text' : 'text-muted hover:text-text',
              )}
            >
              {label}
              <span className="font-mono text-faint">
                {events.filter((e) => key === 'all' || e.outcome === key).length}
              </span>
            </button>
          ))}
        </div>
      </Header>

      {shown.length === 0 ? (
        <div className="flex flex-col items-start gap-2.5 px-4 py-8">
          <strong className="font-medium">{events.length ? 'Nothing in this filter' : 'No incidents yet'}</strong>
          <span className="max-w-[460px] text-muted">
            {events.length
              ? 'Every recent incident has a different status.'
              : 'Anti-Nuke triggers and moderation cases appear here as they happen.'}
          </span>
          {events.length > 0 && <Button size="sm" onClick={() => setFilter('all')}>Show all incidents</Button>}
        </div>
      ) : (
        <ol className="m-0 list-none p-0">
          {shown.map((e) => (
            <li key={e.id} className={rowCls}>
              <time dateTime={e.createdAt} className="pt-px font-mono text-xs text-faint">{relativeTime(e.createdAt)}</time>
              <span className="inline-flex items-center gap-2 capitalize text-muted">
                <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full bg-current', DOT[e.outcomeTone])} />
                {e.action}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">{e.target ?? 'No target'}</span>
                <span className="truncate font-mono text-xs text-faint">by {e.executorName}</span>
              </div>
              <span>{e.outcome}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
