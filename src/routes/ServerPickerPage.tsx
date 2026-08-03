import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, ShieldCheck } from 'lucide-react';
import { useGuilds } from '../hooks/useGuildQueries';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Logo } from '../components/Logo';
import { formatNumber } from '../lib/format';
import { signOut } from '../hooks/useAuth';
import type { GuildSummary, Tier } from '../api/types';

const TIER_TONE: Record<Tier, BadgeTone> = {
  PROTECTED: 'success', GUARDED: 'primary', ELEVATED: 'warning', 'AT RISK': 'critical',
};

function ManageableCard({ g }: { g: GuildSummary }) {
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
            {g.botPresent ? `${formatNumber(g.memberCount)} members` : 'Suzune not added'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {g.botPresent ? (
          <Badge tone={g.tier ? TIER_TONE[g.tier] : 'neutral'}>{g.tier ?? '—'}</Badge>
        ) : (
          <Badge tone="neutral">Not added</Badge>
        )}
        <span className="text-xs font-semibold text-muted">
          {g.botPresent ? 'Manage →' : 'Add Suzune →'}
        </span>
      </div>
    </>
  );

  // Manageable but bot absent → send them to invite it into this guild.
  if (!g.botPresent) {
    return (
      <a href={`/api/invite?guild=${g.id}`} className="block rounded-card">
        <Card className="p-4 transition-colors duration-fast hover:bg-hover">{body}</Card>
      </a>
    );
  }
  return (
    <Link to={`/servers/${g.id}`} className="block rounded-card">
      <Card className="p-4 transition-colors duration-fast hover:bg-hover">{body}</Card>
    </Link>
  );
}

export function ServerPickerPage() {
  const { data, isPending, isError, error } = useGuilds();

  // Only servers the visitor can actually manage. Everything else is hidden,
  // rather than shown as a locked card they can do nothing with.
  const manageable = (data ?? []).filter((g) => g.canManage);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
        <Link to="/">
          <Button variant="secondary" aria-label="Back to home" className="gap-2">
            <ArrowLeft aria-hidden className="size-4" /> Home
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-2.5">
          <Logo size={28} />
          <span className="text-sm font-bold">Suzune</span>
        </div>
        <Button variant="ghost" onClick={signOut} className="text-muted">Sign out</Button>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold">Your servers</h1>
          <p className="text-sm text-muted">
            Showing only servers where you have{' '}
            <strong className="font-semibold text-text">Manage Server</strong>.
          </p>
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
        ) : manageable.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-7" />}
            title="No manageable servers"
            description="You need the Manage Server permission on a server for it to appear here. Add Suzune to a server you run to get started."
            action={
              <a href="/api/invite">
                <Button variant="primary">
                  <Plus aria-hidden className="size-4" /> Add Suzune to a server
                </Button>
              </a>
            }
          />
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2">
              {manageable.map((g) => (
                <li key={g.id}><ManageableCard g={g} /></li>
              ))}
            </ul>
            <div className="mt-6">
              <a href="/api/invite">
                <Button variant="secondary">
                  <Plus aria-hidden className="size-4" /> Add Suzune to another server
                </Button>
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
