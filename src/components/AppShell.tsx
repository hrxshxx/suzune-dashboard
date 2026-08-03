import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  Activity, AlertOctagon, Hammer, Link2, List, Menu, Moon, ShieldCheck, Sparkles,
  Sun, Ticket, TrendingUp, UserPlus, X, LogOut,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useTheme } from '../lib/theme';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { useAntinuke, useGuilds } from '../hooks/useGuildQueries';
import { useAuth, signOut } from '../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Built pages are live; the rest are visible-but-disabled per the brief. */
  soon?: boolean;
}

function navItems(guildId: string): NavItem[] {
  const base = `/servers/${guildId}`;
  return [
    { to: base, label: 'Overview', icon: <Activity aria-hidden className="size-[18px]" /> },
    { to: `${base}/anti-nuke`, label: 'Anti-Nuke', icon: <ShieldCheck aria-hidden className="size-[18px]" /> },
    { to: `${base}/moderation`, label: 'Moderation', icon: <Hammer aria-hidden className="size-[18px]" />, soon: true },
    { to: `${base}/automod`, label: 'Automod', icon: <Sparkles aria-hidden className="size-[18px]" />, soon: true },
    { to: `${base}/logging`, label: 'Logging', icon: <List aria-hidden className="size-[18px]" />, soon: true },
    { to: `${base}/tickets`, label: 'Tickets', icon: <Ticket aria-hidden className="size-[18px]" />, soon: true },
    { to: `${base}/leveling`, label: 'Leveling', icon: <TrendingUp aria-hidden className="size-[18px]" />, soon: true },
    { to: `${base}/welcome`, label: 'Welcome', icon: <UserPlus aria-hidden className="size-[18px]" />, soon: true },
    { to: `${base}/invites`, label: 'Invites', icon: <Link2 aria-hidden className="size-[18px]" />, soon: true },
  ];
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <Button variant="secondary" onClick={toggle} aria-label={`Switch to ${next} theme`} className="size-11 p-0">
      {theme === 'dark'
        ? <Sun aria-hidden className="size-[18px]" />
        : <Moon aria-hidden className="size-[18px]" />}
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
      className="flex items-center gap-3 bg-critical px-5 py-3 text-sm font-semibold text-white"
    >
      <AlertOctagon aria-hidden className="size-5 shrink-0" />
      <span className="flex-1">
        Panic mode is active — any single destructive action will trip Anti-Nuke and punish the executor immediately.
      </span>
      <a href={`/servers/${guildId}/anti-nuke#panic`} className="shrink-0 rounded-pill border border-white/60 bg-white/15 px-3 py-1 text-xs">
        Review
      </a>
    </div>
  );
}

function UserMenu() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-sm font-semibold sm:inline">
        {user.username}
      </span>
      <Button
        variant="secondary"
        onClick={signOut}
        aria-label="Sign out"
        title="Sign out"
        className="size-11 p-0"
      >
        <LogOut aria-hidden className="size-[18px]" />
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { guildId = '' } = useParams();
  const [navOpen, setNavOpen] = useState(false);
  const { data: guilds } = useGuilds();
  const guild = guilds?.find((g) => g.id === guildId);
  const items = navItems(guildId);

  // Close the drawer on route change so it never covers the new page.
  useEffect(() => { setNavOpen(false); }, [guildId]);

  return (
    <div className="min-h-screen">
      <PanicBanner guildId={guildId} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-ctrl focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="flex">
        {navOpen && (
          <div
            className="fixed inset-0 z-30 bg-[color:var(--scrim)] lg:hidden animate-fade-in"
            onClick={() => setNavOpen(false)}
            aria-hidden
          />
        )}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r',
            'border-[color:var(--glass-border)] bg-[color:var(--glass)] backdrop-blur-xl',
            'transition-transform duration-base ease-ease lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center gap-3 p-5">
            <Logo />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Suzune</p>
              <p className="text-xs text-muted">Security Console</p>
            </div>
            <Button
              variant="ghost" size="sm" onClick={() => setNavOpen(false)}
              aria-label="Close navigation" className="ml-auto lg:hidden"
            >
              <X aria-hidden className="size-4" />
            </Button>
          </div>

          <nav aria-label="Sections" className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
            {items.map((item) =>
              item.soon ? (
                <span
                  key={item.label}
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-ctrl px-3 text-sm text-muted opacity-60"
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-pill bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    Soon
                  </span>
                </span>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to.endsWith(guildId)}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-3 rounded-ctrl border px-3 text-sm transition-colors duration-fast',
                      isActive
                        ? 'border-primary/40 bg-primary/10 font-semibold text-primary-text'
                        : 'border-transparent text-muted hover:bg-hover hover:text-text',
                    )
                  }
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              ),
            )}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-md sm:px-7">
            <Button
              variant="secondary" onClick={() => setNavOpen(true)}
              aria-label="Open navigation" className="size-11 p-0 lg:hidden"
            >
              <Menu aria-hidden className="size-[18px]" />
            </Button>

            <NavLink
              to="/servers"
              className="flex min-h-11 items-center gap-2.5 rounded-ctrl border border-border-strong bg-surface px-3 text-sm font-semibold hover:bg-hover"
            >
              <span
                aria-hidden
                className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-primary to-deep text-[11px] font-bold text-white"
              >
                {(guild?.name ?? 'S').slice(0, 1)}
              </span>
              <span className="max-w-[8rem] truncate sm:max-w-[14rem]">
                {guild?.name ?? 'Select server'}
              </span>
            </NavLink>

            <div className="flex-1" />
            <UserMenu />
            <ThemeToggle />
          </header>

          <main id="main" className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-7 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
