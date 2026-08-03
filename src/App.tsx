import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { OverviewPage } from './routes/OverviewPage';
import { AntiNukePage } from './routes/AntiNukePage';
import { ServerPickerPage } from './routes/ServerPickerPage';
import { ComingSoonPage } from './routes/ComingSoonPage';

function GuildLayout({ children }: { children: React.ReactNode }) {
  const { guildId } = useParams();
  if (!guildId) return <Navigate to="/servers" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/servers" replace />} />
      <Route path="/servers" element={<ServerPickerPage />} />
      <Route path="/servers/:guildId" element={<GuildLayout><OverviewPage /></GuildLayout>} />
      <Route path="/servers/:guildId/anti-nuke" element={<GuildLayout><AntiNukePage /></GuildLayout>} />
      <Route path="/servers/:guildId/*" element={<GuildLayout><ComingSoonPage /></GuildLayout>} />
      <Route path="*" element={<Navigate to="/servers" replace />} />
    </Routes>
  );
}
