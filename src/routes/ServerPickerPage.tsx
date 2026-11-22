import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw, Search } from 'lucide-react';
import { useGuilds } from '../hooks/useGuildQueries';
import { Badge } from '../components/ui/Badge';
import { Button, buttonClass } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/AppShell';
import { acronym, formatNumber, tintFor } from '../lib/format';
import { cn } from '../lib/cn';
import { signOut, useAuth } from '../hooks/useAuth';
import type { GuildSummary } from '../api/types';

type Filter = 'all' | 'added' | 'missing';
const FILTERS: [Filter, string][] = [['all', 'All'], ['added', 'Suzune added'], ['missing', 'Not added']];
const matchesFilter = (g: GuildSummary, f: Filter) =>
  f === 'all' || (f === 'added' ? g.botPresent : !g.botPresent);

const card = 'flex flex-col gap-4 rounded-card border border-border bg-surface p-4 transition-colors duration-fast hover:border-border-strong';

function ServerCard({ g }: { g: GuildSummary }) {
  return (
    <li className={card}>
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          style={{ background: tintFor(g.id) }}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border font-semibold"
        >
          {acronym(g.name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{g.name}</span>
          <span className="font-mono text-xs tabular-nums text-faint">
            {g.botPresent ? `${formatNumber(g.memberCount)} members` : g.id}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {g.botPresent
          ? <Badge tone="success" dot>Suzune added</Badge>
          : <Badge dot>Not added</Badge>}
        <span className="flex-1" />
        {g.botPresent ? (
          <Link to={`/servers/${g.id}`} aria-label={`Manage ${g.name}`} className={buttonClass()}>
            Manage
          </Link>
        ) : (
          <a href={`/api/invite?guild=${g.id}`} aria-label={`Add Suzune to ${g.name}`} className={buttonClass()}>
            <Plus aria-hidden className="size-4" />Add Suzune
          </a>
        )}
      </div>
    </li>
  );
}

function UserChip() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 border-l border-border pl-4">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="size-6 rounded-full" />
      ) : (
        <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-full bg-elevated-2 text-xs font-semibold">
          {user.username.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="hidden font-medium sm:inline">{user.username}</span>
      <Button variant="ghost" onClick={signOut} className="h-7 px-2">Log out</Button>
    </div>
  );
}

export function ServerPickerPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useGuilds();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Only servers the visitor can actually manage. Everything else is hidden,
  // rather than shown as a locked card they can do nothing with.
  const all = (data ?? []).filter((g) => g.canManage);
  const q = query.trim().toLowerCase();
  const shown = all.filter(
    (g) => matchesFilter(g, filter) && (!q || g.name.toLowerCase().includes(q) || g.id.includes(q)),
  );
  const ready = !isPending && !isError;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b border-border px-6">
        <Link to="/servers" aria-label="Suzune dashboard"><Logo glyph={false} /></Link>
        <span className="flex-1" />
        <ThemeToggle />
        <UserChip />
      </header>

      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-6 px-6 pb-16 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Servers</h1>
          <p className="text-muted">Servers where you have Manage Server. Pick one to configure Suzune.</p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[220px] sm:w-80">
            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-2 size-4 text-faint" />
            <label htmlFor="srv-search" className="sr-only">Search servers</label>
            <input
              id="srv-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or ID"
              className="h-8 w-full rounded-ctrl border border-border-strong bg-surface pl-8 pr-2.5 text-text placeholder:text-faint"
            />
          </div>
          <div role="group" aria-label="Filter by status" className="inline-flex gap-0.5 self-start overflow-x-auto rounded-ctrl border border-border-strong bg-surface p-0.5">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={cn(
                  'inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded px-2.5 transition-colors duration-fast',
                  filter === key ? 'bg-elevated-2 text-text' : 'text-muted hover:text-text',
                )}
              >
                {label}
                <span className="font-mono text-xs text-faint">{all.filter((g) => matchesFilter(g, key)).length}</span>
              </button>
            ))}
          </div>
          <span className="flex-1" />
          {ready && <span className="font-mono text-xs text-faint">{shown.length} of {all.length}</span>}
        </div>

        {isPending && (
          <div aria-busy="true" aria-label="Loading servers" className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={card}>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-[10px]" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3 w-3/5" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20 rounded-pill" />
                  <Skeleton className="h-8 w-20 rounded-ctrl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div role="alert" className="flex max-w-[520px] flex-col items-start gap-3 rounded-card border border-border bg-surface p-8">
            <AlertCircle aria-hidden className="size-4 text-critical-text" />
            <div className="flex flex-col gap-1">
              <strong className="text-md font-semibold">Couldn't load your servers</strong>
              <span className="text-muted">{(error as Error).message} Nothing was changed.</span>
            </div>
            <Button onClick={() => void refetch()} loading={isFetching}>
              {!isFetching && <RefreshCw aria-hidden className="size-4" />}Retry
            </Button>
          </div>
        )}

        {ready && all.length === 0 && (
          <div className="flex max-w-[520px] flex-col items-start gap-3 rounded-card border border-dashed border-border-strong p-8">
            <strong className="text-md font-semibold">You don't manage any servers yet</strong>
            <span className="text-muted">
              Suzune lists servers where you're the owner or have Manage Server. Ask an owner for that
              permission, or add Suzune to a server you own.
            </span>
            <a href="/api/invite" className={buttonClass('primary')}>Add Suzune to a server</a>
          </div>
        )}

        {ready && all.length > 0 && shown.length === 0 && (
          <div className="flex items-center gap-4 rounded-card border border-dashed border-border-strong p-6">
            <span className="flex-1 text-muted">
              No servers match{q && <> <span className="font-mono text-text">{query}</span></>} in this filter.
            </span>
            <Button onClick={() => { setQuery(''); setFilter('all'); }}>Clear search and filter</Button>
          </div>
        )}

        {ready && shown.length > 0 && (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {shown.map((g) => <ServerCard key={g.id} g={g} />)}
          </ul>
        )}
      </main>
    </div>
  );
}
