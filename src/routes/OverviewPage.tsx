import { useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useEvents, useOverview, useScan } from '../hooks/useGuildQueries';
import { IntegrityHero, IntegrityHeroSkeleton } from '../features/overview/IntegrityHero';
import { ProtectionStrip } from '../features/overview/ProtectionStrip';
import { MetricGrid, MetricGridSkeleton } from '../features/overview/MetricGrid';
import { FindingsList, FindingsSkeleton } from '../features/overview/FindingsList';
import { EventsList, EventsSkeleton } from '../features/overview/EventsList';
import { formatNumber } from '../lib/format';

/** Errors state what failed, why, and the next step. */
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card tone="critical" className="p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-critical-text" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-critical-text">Could not load this section</p>
          <p className="mt-1 text-sm text-muted">{message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function OverviewPage() {
  const { guildId = '' } = useParams();
  const overview = useOverview(guildId);
  const scan = useScan(guildId);
  const events = useEvents(guildId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight">Server Overview</h1>
        <p className="mt-1 text-sm text-muted">
          {overview.data ? (
            <>
              Security posture for{' '}
              <span className="font-semibold text-text">{overview.data.guild.name}</span> ·{' '}
              <span className="font-mono tabular-nums">
                {formatNumber(overview.data.guild.memberCount)} members
              </span>
            </>
          ) : (
            <Skeleton as="span" className="h-4 w-64 align-middle" />
          )}
        </p>
      </header>

      {/* A blocking issue outranks everything else on the page. */}
      {overview.data?.blocking && (
        <Card tone="critical" className="p-5" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-critical-text" />
            <div>
              <p className="font-semibold text-critical-text">{overview.data.blocking.title}</p>
              <p className="mt-1 text-sm">{overview.data.blocking.detail}</p>
              <p className="mt-2 text-sm font-semibold">Fix: {overview.data.blocking.fix}</p>
            </div>
          </div>
        </Card>
      )}

      {overview.isError ? (
        <ErrorCard
          message={(overview.error as Error).message}
          onRetry={() => void overview.refetch()}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {overview.isPending ? (
            <>
              <IntegrityHeroSkeleton />
              <Card className="p-5"><Skeleton className="h-40 w-full" /></Card>
            </>
          ) : (
            <>
              <IntegrityHero
                score={overview.data.integrityIndex}
                tier={overview.data.tier}
                verdict={overview.data.verdict}
                history={overview.data.history}
              />
              <ProtectionStrip items={overview.data.protection} />
            </>
          )}
        </div>
      )}

      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="mb-3 text-base font-bold">Server metrics</h2>
        {overview.isPending ? <MetricGridSkeleton /> : overview.data ? (
          <MetricGrid metrics={overview.data.metrics} />
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {scan.isPending ? <FindingsSkeleton /> : scan.isError ? (
          <ErrorCard message={(scan.error as Error).message} onRetry={() => void scan.refetch()} />
        ) : (
          <FindingsList
            grade={scan.data.grade}
            scannedAt={scan.data.scannedAt}
            findings={scan.data.findings}
          />
        )}

        {events.isPending ? <EventsSkeleton /> : events.isError ? (
          <ErrorCard message={(events.error as Error).message} onRetry={() => void events.refetch()} />
        ) : (
          <EventsList events={events.data} />
        )}
      </div>
    </div>
  );
}
