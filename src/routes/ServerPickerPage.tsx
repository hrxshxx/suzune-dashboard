import { Link } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useGuilds } from '../hooks/useGuildQueries';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Logo } from '../components/Logo';
import { formatNumber } from '../lib/format';
import type { Tier } from '../api/types';

const TIER_TONE: Record<Tier, BadgeTone> = {
  PROTECTED: 'success', GUARDED: 'primary', ELEVATED: 'warning', 'AT RISK': 'critical',
};

export function ServerPickerPage() {
  const { data, isPending, isError, error } = useGuilds();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Logo />
        <div>
          <h1 className="text-lg font-bold">Your servers</h1>
          <p className="text-sm text-muted">
            Pick a server to manage. You can configure any server where you have{' '}
            <strong className="font-semibold text-text">Manage Server</strong>.
          </p>
        </div>
      </div>

      {isError && (
        <Card tone="critical" className="p-5">
          <p className="font-semibold text-critical-text">Could not load your servers</p>
          <p className="mt-1 text-sm text-muted">{(error as Error).message}</p>
        </Card>
      )}

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-card" />)}
        </div>
      ) : data && data.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-7" />}
          title="No servers yet"
          description="Add Suzune to a server you manage, then it will appear here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {(data ?? []).map((g) => {
            const disabled = !g.canManage || !g.botPresent;
            const body = (
              <>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-ctrl bg-gradient-to-br from-primary to-deep text-base font-bold text-white"
                  >
                    {g.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{g.name}</p>
                    <p className="font-mono text-xs text-muted tabular-nums">
                      {formatNumber(g.memberCount)} members
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {!g.canManage ? (
                    <Badge tone="neutral" icon={<Lock aria-hidden className="size-3" />}>No access</Badge>
                  ) : !g.botPresent ? (
                    <Badge tone="neutral">Not added</Badge>
                  ) : (
                    <Badge tone={g.tier ? TIER_TONE[g.tier] : 'neutral'}>{g.tier ?? '—'}</Badge>
                  )}
                  <span className="text-xs font-semibold text-muted">
                    {!g.canManage ? 'Manage Server required' : !g.botPresent ? 'Add bot' : 'Manage →'}
                  </span>
                </div>
              </>
            );

            return (
              <li key={g.id}>
                {disabled ? (
                  <Card
                    aria-disabled="true"
                    title={!g.canManage ? 'You need Manage Server in this server' : 'Suzune is not in this server yet'}
                    className="cursor-not-allowed p-4 opacity-60"
                  >
                    {body}
                  </Card>
                ) : (
                  <Link to={`/servers/${g.id}`} className="block rounded-card">
                    <Card className="p-4 transition-colors duration-fast hover:bg-hover">{body}</Card>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
