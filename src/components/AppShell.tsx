import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useParams } from 'react-router-dom';
import {
  AlertOctagon, ChevronsUpDown, FileText, Gavel, LayoutDashboard, LayoutGrid, Link2, LogOut, Menu,
  Moon, ScanText, ShieldCheck, Sun, Ticket, TrendingUp, UserPlus, X,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useTheme } from '../lib/theme';
import { acronym, tintFor } from '../lib/format';
import { Logo } from './Logo';
import { Button, buttonClass } from './ui/Button';
import { useAntinuke, useGuilds } from '../hooks/useGuildQueries';
import { useAuth, signOut } from '../hooks/useAuth';
import { FUNCTIONAL_FEATURES } from '../lib/featureSchemas';
import type { GuildSummary } from '../api/types';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  /** Feature key; when it is in FUNCTIONAL_FEATURES the page is live. */
  key?: string;
  /** Forces the disabled state regardless of key (e.g. invites has no config). */
  soon?: boolean;
}

const isSoon = (item: NavItem) =>
  item.soon === true || (item.key !== undefined && !FUNCTIONAL_FEATURES.includes(item.key));

const ico = 'size-4 shrink-0';

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Security',
    items: [
      { path: '', label: 'Overview', icon: <LayoutDashboard aria-hidden className={ico} /> },
      { path: 'anti-nuke', label: 'Anti-nuke', icon: <ShieldCheck aria-hidden className={ico} /> },
      { path: 'automod', label: 'Automod', icon: <ScanText aria-hidden className={ico} />, key: 'automod' },
    ],
  },
  {
    group: 'Moderation',
    items: [
      { path: 'moderation', label: 'Moderation', icon: <Gavel aria-hidden className={ico} />, key: 'moderation' },
      { path: 'logging', label: 'Logging', icon: <FileText aria-hidden className={ico} />, key: 'logging' },
    ],
  },
  {
    group: 'Community',
    items: [
      { path: 'welcome', label: 'Welcome & roles', icon: <UserPlus aria-hidden className={ico} />, key: 'welcome' },
      { path: 'tickets', label: 'Tickets', icon: <Ticket aria-hidden className={ico} />, key: 'tickets' },
      { path: 'leveling', label: 'Leveling', icon: <TrendingUp aria-hidden className={ico} />, key: 'leveling' },
      { path: 'invites', label: 'Invite tracking', icon: <Link2 aria-hidden className={ico} />, soon: true },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);

/** The label of the page the URL points at, for the breadcrumb. */
function pageLabel(pathname: string, guildId: string): string {
  const rest = pathname.split(`/servers/${guildId}`)[1]?.replace(/^\//, '').split('/')[0] ?? '';
  return ALL_ITEMS.find((i) => i.path === rest)?.label ?? 'Overview';
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <Button variant="ghost" onClick={toggle} aria-label={`Switch to ${next} theme`} className="w-8 px-0">
      {theme === 'dark' ? <Sun aria-hidden className={ico} /> : <Moon aria-hidden className={ico} />}
    </Button>
  );
}

/** Persistent, app-wide while panic mode is on. */
function PanicBanner({ guildId }: { guildId: string }) {
  const { data } = useAntinuke(guildId);
  if (!data?.panicMode) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-3 bg-[color-mix(in_srgb,var(--critical)_12%,transparent)] px-6 py-2.5"
    >
      <AlertOctagon aria-hidden className={cn(ico, 'text-critical-text')} />
      <span className="flex-1">
        <strong className="font-semibold">Panic mode is on.</strong>{' '}
        <span className="text-muted">
          Any single destructive action trips Anti-Nuke and punishes the executor immediately.
        </span>
      </span>
      <Link to={`/servers/${guildId}/anti-nuke#panic`} className={buttonClass('secondary', 'sm')}>
        Review
      </Link>
    </div>
  );
}

function Tile({ g, size }: { g: Pick<GuildSummary, 'id' | 'name'>; size: 22 | 28 }) {
  return (
    <span
      aria-hidden
      style={{ background: tintFor(g.id), width: size, height: size }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border border-border text-xs font-semibold',
        size === 28 ? 'rounded-[7px]' : 'rounded-[6px]',
      )}
    >
      {size === 28 ? acronym(g.name) : g.name.slice(0, 1)}
    </span>
  );
}

function ServerSwitcher({ guildId }: { guildId: string }) {
  const [open, setOpen] = useState(false);
  const { data: guilds } = useGuilds();
  const current = guilds?.find((g) => g.id === guildId);
  const others = (guilds ?? []).filter((g) => g.canManage && g.botPresent);

  useEffect(() => { setOpen(false); }, [guildId]);

  return (
    <div className="relative p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full items-center gap-2.5 rounded-ctrl border border-border-strong bg-surface px-2 text-left hover:bg-elevated-2"
      >
        <Tile g={current ?? { id: guildId, name: '?' }} size={28} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-medium">{current?.name ?? 'Loading…'}</span>
          <span className="text-xs text-faint">
            {current ? (current.botPresent ? 'Suzune added' : 'Suzune not added') : ' '}
          </span>
        </span>
        <ChevronsUpDown aria-hidden className={cn(ico, 'text-faint')} />
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close server menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            role="listbox"
            aria-label="Switch server"
            className="absolute inset-x-3 top-[60px] z-[31] animate-fade-in rounded-card border border-border-strong bg-elevated p-1 shadow-modal"
          >
            {others.map((g) => (
              <Link
                key={g.id}
                to={`/servers/${g.id}`}
                role="option"
                aria-selected={g.id === guildId}
                className={cn(
                  'flex h-9 items-center gap-2.5 rounded-ctrl px-2.5 hover:bg-selected',
                  g.id === guildId && 'bg-selected',
                )}
              >
                <Tile g={g} size={22} />
                <span className="min-w-0 flex-1 truncate">{g.name}</span>
                {g.id === guildId && <span className="text-xs text-faint">Current</span>}
              </Link>
            ))}
            <div className="-mx-1 mt-1 border-t border-border px-1 pt-1">
              <Link to="/servers" className="flex h-9 items-center gap-2.5 rounded-ctrl px-2.5 text-muted hover:bg-selected">
                <LayoutGrid aria-hidden className={ico} />
                All servers
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserFooter() {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="size-6 rounded-full" />
      ) : (
        <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-full bg-elevated-2 text-xs font-semibold">
          {(user?.username ?? '?').slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate font-medium">{user?.username}</span>
      <ThemeToggle />
      <Button variant="ghost" onClick={signOut} aria-label="Log out" title="Log out" className="w-8 px-0">
        <LogOut aria-hidden className={ico} />
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { guildId = '' } = useParams();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { data: guilds } = useGuilds();
  const guild = guilds?.find((g) => g.id === guildId);
  const base = `/servers/${guildId}`;

  // Close the drawer on route change so it never covers the new page.
  useEffect(() => { setNavOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-ctrl focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>

      <div className="flex">
        {navOpen && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-[35] animate-fade-in bg-[color:var(--scrim)] lg:hidden"
          />
        )}

        <aside
          aria-label="Server navigation"
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col border-r border-border bg-bg',
            'transition-transform duration-base ease-ease lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            navOpen ? 'translate-x-0 shadow-modal' : '-translate-x-full',
          )}
        >
          <div className="flex h-12 items-center gap-2 border-b border-border px-4">
            <Link to="/servers" aria-label="All servers"><Logo /></Link>
            <span className="flex-1" />
            <Button variant="ghost" onClick={() => setNavOpen(false)} aria-label="Close navigation" className="w-8 px-0 lg:hidden">
              <X aria-hidden className={ico} />
            </Button>
          </div>

          <ServerSwitcher guildId={guildId} />

          <nav aria-label="Dashboard sections" className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-3 pb-3">
            {NAV.map(({ group, items }) => (
              <div key={group} className="flex flex-col gap-px">
                <span className="flex h-6 items-center px-2 text-xs font-medium text-faint">{group}</span>
                {items.map((item) =>
                  isSoon(item) ? (
                    <span
                      key={item.label}
                      aria-disabled="true"
                      className="flex h-[30px] items-center gap-2.5 rounded-ctrl px-2 text-faint"
                    >
                      {item.icon}
                      {item.label}
                      <span className="ml-auto font-mono text-xs">soon</span>
                    </span>
                  ) : (
                    <NavLink
                      key={item.label}
                      to={item.path ? `${base}/${item.path}` : base}
                      end={!item.path}
                      className={({ isActive }) =>
                        cn(
                          'group flex h-[30px] items-center gap-2.5 rounded-ctrl px-2 transition-colors duration-fast',
                          isActive ? 'bg-selected text-text' : 'text-muted hover:bg-hover hover:text-text',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={cn('inline-flex', isActive && 'text-primary-text')}>{item.icon}</span>
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  ),
                )}
              </div>
            ))}
          </nav>

          <UserFooter />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-bg pl-6 pr-4">
            <Button variant="ghost" onClick={() => setNavOpen(true)} aria-label="Open navigation" className="-ml-2 w-8 px-0 lg:hidden">
              <Menu aria-hidden className={ico} />
            </Button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-muted">
              <Link to="/servers" className="truncate hover:text-text">{guild?.name ?? 'Servers'}</Link>
              <span aria-hidden className="text-faint">/</span>
              <span aria-current="page" className="whitespace-nowrap font-medium text-text">
                {pageLabel(pathname, guildId)}
              </span>
            </nav>
          </header>

          <PanicBanner guildId={guildId} />

          <main id="main" className="flex w-full max-w-[1280px] flex-1 flex-col gap-4 px-6 pb-24 pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
