import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { useAuth, signIn } from '../hooks/useAuth';
import { SUPPORT_INVITE } from '../lib/brand';

// Codes the OAuth callback redirects back with (see the bot's webapi/server.js).
const AUTH_ERRORS: Record<string, string> = {
  bad_state: 'Your sign-in session expired before Discord answered. Try again.',
  exchange_failed: "Discord didn't confirm the sign-in. Try again.",
  missing_code: "Discord didn't send a sign-in code. Try again.",
  access_denied: 'Sign-in was cancelled on Discord.',
};

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const authError = params.get('auth_error');

  if (isAuthenticated) return <Navigate to={from ?? '/servers'} replace />;

  return (
    <main className="flex min-h-screen flex-col px-8 py-6">
      <header><Logo /></header>

      <section aria-labelledby="signin-title" className="flex flex-1 items-center justify-center py-12">
        <div className="flex w-full max-w-[360px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 id="signin-title" className="text-xl font-semibold tracking-[-0.02em]">Sign in to the dashboard</h1>
            <p className="text-muted">
              Configure Suzune for the servers you manage. Changes here apply instantly, the same as
              running the slash commands.
            </p>
          </div>

          {authError && (
            <p role="alert" className="flex items-start gap-2 rounded-ctrl bg-[color-mix(in_srgb,var(--critical)_12%,transparent)] px-3 py-2">
              <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-critical-text" />
              {AUTH_ERRORS[authError] ?? 'Sign-in failed. Try again.'}
            </p>
          )}

          <Button variant="primary" size="lg" onClick={() => signIn(from)}>
            Continue with Discord
            <ArrowUpRight aria-hidden className="size-4" />
          </Button>

          <div className="flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-faint">
            <span>Requested scopes</span>
            <span className="font-mono text-muted">identify  guilds</span>
            <span>Suzune never sees your password or messages through this sign-in.</span>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap gap-4 text-xs text-faint">
        <Link to="/docs" className="text-muted hover:text-text">Docs</Link>
        <a href={SUPPORT_INVITE} target="_blank" rel="noreferrer noopener" className="text-muted hover:text-text">
          Support server
        </a>
      </footer>
    </main>
  );
}
