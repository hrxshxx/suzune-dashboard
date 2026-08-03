import { Link } from 'react-router-dom';
import {
  ArrowRight, Eye, Gauge, ScanLine, ShieldCheck, Undo2, Users, Zap,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useTheme } from '../lib/theme';
import { useAuth, signIn } from '../hooks/useAuth';
import { SUPPORT_INVITE, STUDIO, DEVELOPER } from '../lib/brand';
import { Moon, Sun } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Anti-Nuke',
    body: 'Fifteen destructive actions watched per executor, each with its own limit and time window. Breach one and the executor is banned, kicked, stripped or quarantined.',
  },
  {
    icon: Zap,
    title: 'Anti-Raid',
    body: 'Join spikes are detected and mitigated before your moderators have woken up.',
  },
  {
    icon: Undo2,
    title: 'Auto-revert',
    body: 'Deleted channels and roles are recreated, and rogue webhooks removed, where Discord allows it.',
  },
  {
    icon: Users,
    title: 'Whitelist that still catches',
    body: 'Trusted admins bypass detection for routine work, while a separate higher limit still stops a compromised account.',
  },
  {
    icon: ScanLine,
    title: 'Deep scan',
    body: 'A graded audit of your server, each finding linking to the exact control that fixes it.',
  },
  {
    icon: Gauge,
    title: 'Integrity index',
    body: 'One number, 0–100, for whether this server would survive a determined attacker.',
  },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="secondary"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="size-11 p-0"
    >
      {theme === 'dark'
        ? <Sun aria-hidden className="size-[18px]" />
        : <Moon aria-hidden className="size-[18px]" />}
    </Button>
  );
}

export function LandingPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-[1100px] items-center gap-3 px-5 py-5">
        <div className="flex flex-1 items-center gap-3">
          <Logo />
          <span className="text-base font-bold tracking-tight">Suzune</span>
        </div>
        <ThemeToggle />
        {isLoading ? (
          <Skeleton className="h-11 w-32" />
        ) : isAuthenticated ? (
          <Link to="/servers">
            <Button variant="primary">
              Open dashboard <ArrowRight aria-hidden className="size-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={() => signIn()}>
            Sign in with Discord
          </Button>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-[1100px] items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-2 lg:pt-14">
          <div>
            <Badge tone="primary" icon={<ShieldCheck aria-hidden className="size-3.5" />}>
              Discord server security
            </Badge>
            <h1 className="mt-4 text-2xl font-bold leading-[1.1] tracking-tight sm:text-3xl">
              Lock down your Discord server.
            </h1>
            <p className="mt-4 max-w-prose text-base text-muted">
              Suzune watches destructive actions in near-real-time, punishes the executor,
              and reverts the damage — then gives your team one calm console to tune it all.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/servers">
                  <Button variant="primary" size="lg">
                    Open dashboard <ArrowRight aria-hidden className="size-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" size="lg" onClick={() => signIn()}>
                  Sign in with Discord
                </Button>
              )}
              <Link to="/docs" className="inline-flex">
                <Button variant="secondary" size="lg">Read the docs</Button>
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <Eye aria-hidden className="size-3.5" />
              Signing in only reads your username and which servers you are in.
            </p>
          </div>

          {/* A calm, honest preview — not a fake screenshot. */}
          <Card glass className="p-6">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-ctrl bg-gradient-to-br from-primary to-deep text-base font-bold text-white"
              >
                A
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">Your server</p>
                <p className="font-mono text-xs text-muted">protected by Suzune</p>
              </div>
              <Badge tone="success" icon={<ShieldCheck aria-hidden className="size-3.5" />}>
                PROTECTED
              </Badge>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-ctrl border border-border bg-surface/70 p-3">
                <dt className="text-xs text-muted">Integrity index</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums">94<span className="text-sm text-muted">/100</span></dd>
              </div>
              <div className="rounded-ctrl border border-border bg-surface/70 p-3">
                <dt className="text-xs text-muted">Actions watched</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums">15</dd>
              </div>
            </dl>

            <ul className="mt-3 space-y-2">
              {[
                ['Anti-Nuke', true],
                ['Anti-Raid', true],
                ['Auto-revert', true],
              ].map(([label, on]) => (
                <li
                  key={String(label)}
                  className="flex items-center gap-2.5 rounded-ctrl border border-border bg-surface/70 px-3 py-2"
                >
                  <ShieldCheck aria-hidden className="size-4 text-success-text" />
                  <span className="flex-1 text-sm font-semibold">{label}</span>
                  <span className="text-xs font-semibold text-success-text">
                    {on ? 'On' : 'Off'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-[1100px] px-5 py-12">
          <h2 className="text-center text-lg font-bold tracking-tight">
            Built around one question
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted">
            Would this server survive someone with Administrator deciding to burn it down?
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <Card className="h-full p-5">
                  <span
                    aria-hidden
                    className="grid size-11 place-items-center rounded-ctrl bg-primary/10 text-primary-text"
                  >
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-3.5 text-sm font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{f.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {/* Close */}
        <section className="mx-auto w-full max-w-[1100px] px-5 pb-16">
          <Card glass className="p-8 text-center">
            <h2 className="text-lg font-bold tracking-tight">
              {isAuthenticated ? `Welcome back, ${user?.username}.` : 'Ready to lock it down?'}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {isAuthenticated
                ? 'Pick a server and review its security posture.'
                : 'Sign in with Discord to configure any server where you have Manage Server.'}
            </p>
            <div className="mt-5 flex justify-center">
              {isAuthenticated ? (
                <Link to="/servers">
                  <Button variant="primary" size="lg">
                    Open dashboard <ArrowRight aria-hidden className="size-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" size="lg" onClick={() => signIn()}>
                  Sign in with Discord
                </Button>
              )}
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <div>
              <p className="text-sm font-bold">Suzune</p>
              <p className="text-xs text-muted">Security for Discord communities</p>
            </div>
          </div>
          <div className="flex-1" />
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link to="/docs" className="text-muted hover:text-text">Docs</Link>
            <a href={SUPPORT_INVITE} target="_blank" rel="noreferrer noopener" className="text-muted hover:text-text">
              Support server
            </a>
            <a href="https://github.com/HrxshxYT/Suzune" target="_blank" rel="noreferrer noopener" className="text-muted hover:text-text">
              GitHub
            </a>
          </nav>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center gap-x-2 gap-y-1 px-5 py-4 text-xs text-muted">
            <span>© {new Date().getFullYear()} {STUDIO}.</span>
            <span>Developed by {DEVELOPER}.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
