import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { OverviewPage } from './routes/OverviewPage';
import { AntiNukePage } from './routes/AntiNukePage';
import { ServerPickerPage } from './routes/ServerPickerPage';
import { ComingSoonPage } from './routes/ComingSoonPage';
import { LandingPage } from './routes/LandingPage';
import { useAuth } from './hooks/useAuth';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Skeleton } from './components/ui/Skeleton';

/**
 * Gate for everything behind sign-in.
 *
 * Being signed out is a normal state, not an error — send the visitor to the
 * landing page rather than showing them a failure they cannot act on.
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, unauthenticated, error, refetch } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-10">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (unauthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // A real failure (server down, network) — distinct from being signed out.
  if (error) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-16">
        <Card tone="critical" className="p-5 text-center">
          <p className="font-semibold text-critical-text">Could not reach the dashboard</p>
          <p className="mt-1 text-sm text-muted">{error.message}</p>
          <Button variant="secondary" className="mt-4" onClick={() => void refetch()}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function GuildLayout({ children }: { children: ReactNode }) {
  const { guildId } = useParams();
  if (!guildId) return <Navigate to="/servers" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/servers"
        element={<RequireAuth><ServerPickerPage /></RequireAuth>}
      />
      <Route
        path="/servers/:guildId"
        element={<RequireAuth><GuildLayout><OverviewPage /></GuildLayout></RequireAuth>}
      />
      <Route
        path="/servers/:guildId/anti-nuke"
        element={<RequireAuth><GuildLayout><AntiNukePage /></GuildLayout></RequireAuth>}
      />
      <Route
        path="/servers/:guildId/*"
        element={<RequireAuth><GuildLayout><ComingSoonPage /></GuildLayout></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
