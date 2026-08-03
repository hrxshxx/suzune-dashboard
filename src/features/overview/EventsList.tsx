import { History } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/cn';
import { initials, relativeTime } from '../../lib/format';
import type { SecurityEvent } from '../../api/types';

const TONE: Record<SecurityEvent['outcomeTone'], string> = {
  critical: 'text-critical-text',
  warning: 'text-warning-text',
  success: 'text-success-text',
  muted: 'text-muted',
};

export function EventsSkeleton() {
  return (
    <Card>
      <CardHeader title="Recent security events" />
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-11 w-full" />)}
      </div>
    </Card>
  );
}

export function EventsList({ events }: { events: SecurityEvent[] }) {
  return (
    <Card>
      <CardHeader title="Recent security events" description="Last 10 triggers and moderation cases" />
      {events.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<History className="size-7" />}
            title="Nothing yet"
            description="Anti-Nuke triggers and moderation cases will appear here as they happen."
          />
        </div>
      ) : (
        <ul>
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-pill bg-elevated font-mono text-xs font-semibold text-primary-text"
              >
                {initials(e.executorName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <span className="font-semibold">{e.executorName}</span>{' '}
                  <span className="text-muted">{e.action}</span>
                </p>
                {e.target && <p className="truncate font-mono text-xs text-muted">{e.target}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className={cn('text-xs font-semibold', TONE[e.outcomeTone])}>{e.outcome}</p>
                <p className="font-mono text-xs text-muted">{relativeTime(e.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
