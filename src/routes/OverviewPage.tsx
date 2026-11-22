import { Link, useParams } from 'react-router-dom';
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, buttonClass } from '../components/ui/Button';
import { useEvents, useOverview, useScan } from '../hooks/useGuildQueries';
import { ProtectionStrip } from '../features/overview/ProtectionStrip';
import { ServerFacts, StatsRow, StatsRowSkeleton } from '../features/overview/MetricGrid';
import { FindingsList, FindingsSkeleton } from '../features/overview/FindingsList';
import { EventsList, EventsSkeleton } from '../features/overview/EventsList';
import { Skeleton } from '../components/ui/Skeleton';
import { relativeTime } from '../lib/format';

/** Errors state what failed, why, and the next step. */
function ErrorPanel({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex max-w-[560px] flex-col items-start gap-3 rounded-card border border-border bg-surface p-8">
      <AlertCircle aria-hidden className="size-4 text-critical-text" />
      <div className="flex flex-col gap-1">
        <h2 className="text-md font-semibold">{title}</h2>
        <p className="text-muted">{message} Protection in the server is unaffected; only the dashboard couldn't read it.</p>
      </div>
      <Button onClick={onRetry}><RefreshCw aria-hidden className="size-4" />Retry</Button>
    </div>
  );
}

export function OverviewPage() {
  const { guildId = '' } = useParams();
  const overview = useOverview(guildId);
  const scan = useScan(guildId);
  const events = useEvents(guildId);
  const o = overview.data;

  if (overview.isError) {
    return (
      <ErrorPanel
        title="Couldn't load this server"
        message={(overview.error as Error).message}
        onRetry={() => void overview.refetch()}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Overview</h1>
          <span className="font-mono text-xs text-faint">
            {guildId}{scan.data && ` · scanned ${relativeTime(scan.data.scannedAt)}`}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { void scan.refetch(); void overview.refetch(); }} loading={scan.isFetching}>
            {!scan.isFetching && <RefreshCw aria-hidden className="size-4" />}Re-scan
          </Button>
          <Link to={`/servers/${guildId}/anti-nuke`} className={buttonClass('primary')}>Anti-nuke settings</Link>
        </div>
      </div>

      {/* A blocking issue outranks everything else on the page. */}
      {o?.blocking && (
        <div role="alert" className="flex animate-slide-up items-start gap-3 rounded-card bg-[color-mix(in_srgb,var(--critical)_12%,transparent)] px-4 py-2.5">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-critical-text" />
          <span className="flex-1">
            <strong className="font-semibold">{o.blocking.title}.</strong>{' '}
            <span className="text-muted">{o.blocking.detail} {o.blocking.fix}</span>
          </span>
        </div>
      )}

      {o ? <StatsRow metrics={o.metrics} /> : <StatsRowSkeleton />}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {!o || scan.isPending ? <FindingsSkeleton /> : scan.isError ? (
            <ErrorPanel title="Couldn't run the scan" message={(scan.error as Error).message} onRetry={() => void scan.refetch()} />
          ) : (
            <FindingsList score={o.integrityIndex} tier={o.tier} verdict={o.verdict} findings={scan.data.findings} />
          )}

          {events.isPending ? <EventsSkeleton /> : events.isError ? (
            <ErrorPanel title="Couldn't load incidents" message={(events.error as Error).message} onRetry={() => void events.refetch()} />
          ) : (
            <EventsList events={events.data} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {o ? (
            <>
              <ProtectionStrip items={o.protection} />
              <ServerFacts guildId={guildId} metrics={o.metrics} />
            </>
          ) : (
            <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
              {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
