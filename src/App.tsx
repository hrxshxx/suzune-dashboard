import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { OverviewPage } from './routes/OverviewPage';
import { AntiNukePage } from './routes/AntiNukePage';
import { ServerPickerPage } from './routes/ServerPickerPage';
import { ComingSoonPage } from './routes/ComingSoonPage';
import { FeaturePage } from './routes/FeaturePage';
import { LoginPage } from './routes/LoginPage';
import { DocsPage } from './routes/DocsPage';
import { FUNCTIONAL_FEATURES } from './lib/featureSchemas';
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
      <div aria-busy="true" className="mx-auto w-full max-w-[1240px] px-6 py-8">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[122px] rounded-card" />
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
        <Card className="p-6">
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
      <Route path="/" element={<LoginPage />} />
      <Route path="/docs" element={<DocsPage />} />

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

      {/* Schema-driven feature pages, one route per functional feature. */}
      {FUNCTIONAL_FEATURES.map((feature) => (
        <Route
          key={feature}
          path={`/servers/:guildId/${feature}`}
          element={<RequireAuth><GuildLayout><FeaturePage feature={feature} /></GuildLayout></RequireAuth>}
        />
      ))}

      {/* Anything else (e.g. invites, which has no config) stays informational. */}
      <Route
        path="/servers/:guildId/*"
        element={<RequireAuth><GuildLayout><ComingSoonPage /></GuildLayout></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
