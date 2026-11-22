import { Skeleton } from '../../components/ui/Skeleton';
import { formatNumber } from '../../lib/format';
import type { Metric } from '../../api/types';

const val = (metrics: Metric[], key: string) => metrics.find((m) => m.key === key)?.value ?? '—';
const show = (v: number | string) => (typeof v === 'number' ? formatNumber(v) : v);

const statCls = 'flex flex-col gap-1 border-border px-4 py-3.5 [&:nth-child(n+2)]:border-l max-lg:[&:nth-child(3)]:border-l-0 max-lg:[&:nth-child(n+3)]:border-t';

/** The four headline numbers across the top of the Overview. */
export function StatsRow({ metrics }: { metrics: Metric[] }) {
  const stats = [
    { label: 'Members', value: val(metrics, 'members'), sub: `${show(val(metrics, 'whitelisted'))} whitelisted` },
    { label: 'Channels', value: val(metrics, 'channels'), sub: `${show(val(metrics, 'webhooks'))} webhooks` },
    { label: 'Admin roles', value: val(metrics, 'adminRoles'), sub: `of ${show(val(metrics, 'roles'))} roles` },
    { label: 'Threat roles', value: val(metrics, 'threatRoles'), sub: `Permission risk: ${val(metrics, 'permRisk')}` },
  ];
  return (
    <section aria-label="Server at a glance" className="grid grid-cols-2 rounded-card border border-border bg-surface lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={statCls}>
          <span className="text-muted">{s.label}</span>
          <span className="text-xl font-medium leading-tight tracking-[-0.02em] tabular-nums">{show(s.value)}</span>
          <span className="text-xs text-faint">{s.sub}</span>
        </div>
      ))}
    </section>
  );
}

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 rounded-card border border-border bg-surface lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={statCls}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-1 h-6 w-14" />
        </div>
      ))}
    </div>
  );
}

/** Key/value facts about the server, in the right-hand column. */
export function ServerFacts({ guildId, metrics }: { guildId: string; metrics: Metric[] }) {
  const facts: { k: string; v: string; mono?: boolean; threat?: boolean }[] = [
    { k: 'Server ID', v: guildId, mono: true },
    { k: 'Roles', v: String(show(val(metrics, 'roles'))) },
    { k: 'Unreachable roles', v: String(show(val(metrics, 'brokenRoles'))), threat: Number(val(metrics, 'brokenRoles')) > 0 },
    { k: 'Webhooks', v: String(show(val(metrics, 'webhooks'))) },
    { k: 'Whitelisted', v: String(show(val(metrics, 'whitelisted'))) },
    { k: 'Firewall', v: String(val(metrics, 'firewall')) },
  ];
  return (
    <section aria-labelledby="srv-h" className="rounded-card border border-border bg-surface">
      <div className="flex h-11 items-center border-b border-border px-4">
        <h2 id="srv-h" className="font-semibold">Server</h2>
      </div>
      <dl className="m-0">
        {facts.map((f) => (
          <div key={f.k} className="flex justify-between gap-3 border-t border-border px-4 py-[9px] first:border-t-0">
            <dt className="text-muted">{f.k}</dt>
            <dd className={`m-0 min-w-0 truncate text-right ${f.mono ? 'font-mono text-xs' : ''} ${f.threat ? 'text-critical-text' : ''}`}>
              {f.v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
