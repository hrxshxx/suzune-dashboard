import { AlertOctagon, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/cn';
import { formatDelta, formatNumber } from '../../lib/format';
import type { Metric } from '../../api/types';

export function MetricGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }, (_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-7 w-12" />
        </Card>
      ))}
    </div>
  );
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((m) => {
        const numeric = typeof m.value === 'number';
        const isThreat = Boolean(m.isThreat) && numeric && (m.value as number) > 0;
        const clear = Boolean(m.isThreat) && numeric && (m.value as number) === 0;
        const delta = formatDelta(m.delta);
        return (
          <Card key={m.key} className={cn('p-4', isThreat && 'border-critical/50')}>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted">{m.label}</p>
              {isThreat && <AlertOctagon aria-hidden className="size-3.5 text-critical-text" />}
              {clear && <Check aria-hidden className="size-3.5 text-success-text" />}
            </div>
            <p className={cn(
              'mt-2 text-xl font-bold tabular-nums',
              isThreat ? 'text-critical-text' : 'text-text',
            )}>
              {numeric ? formatNumber(m.value as number) : m.value}
            </p>
            <p className="mt-0.5 h-4 font-mono text-xs text-muted">
              {delta ? `${delta} vs 7d` : ''}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
