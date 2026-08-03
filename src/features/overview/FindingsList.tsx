import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, ChevronDown, Info, ScanLine, ShieldCheck } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/cn';
import { relativeTime } from '../../lib/format';
import type { Finding, Severity } from '../../api/types';

const SEVERITY: Record<Severity, { label: string; tone: BadgeTone; icon: ReactNode }> = {
  critical: { label: 'Critical', tone: 'critical', icon: <AlertOctagon aria-hidden className="size-4" /> },
  warning: { label: 'Warning', tone: 'warning', icon: <AlertTriangle aria-hidden className="size-4" /> },
  info: { label: 'Info', tone: 'info', icon: <Info aria-hidden className="size-4" /> },
};

export function FindingsSkeleton() {
  return (
    <Card>
      <CardHeader title="Scan findings" description="Checking this server…" />
      <div className="space-y-3 p-5">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    </Card>
  );
}

function Group({ severity, findings, defaultOpen }: {
  severity: Severity; findings: Finding[]; defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = SEVERITY[severity];

  return (
    <div className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-11 w-full items-center gap-2.5 px-5 py-3 text-left hover:bg-hover"
        >
          <span className={cn(
            severity === 'critical' ? 'text-critical-text'
              : severity === 'warning' ? 'text-warning-text' : 'text-info-text',
          )}>
            {meta.icon}
          </span>
          <span className="flex-1 text-sm font-semibold">{meta.label}</span>
          <Badge tone={findings.length ? meta.tone : 'neutral'}>{findings.length}</Badge>
          <ChevronDown
            aria-hidden
            className={cn('size-4 text-muted transition-transform duration-fast', open && 'rotate-180')}
          />
        </button>
      </h3>

      {open && (
        <div className="space-y-2 px-5 pb-4">
          {findings.length === 0 ? (
            <p className="py-2 text-sm text-muted">Nothing found — this category is clear.</p>
          ) : (
            findings.map((f) => (
              <div key={f.id} className="flex flex-wrap items-start gap-3 rounded-ctrl bg-elevated p-3.5">
                <div className="min-w-[12rem] flex-1">
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="mt-1 text-sm text-muted">{f.detail}</p>
                </div>
                {f.fixAction && (
                  <Link
                    to={f.fixAction.href}
                    className={cn(
                      'inline-flex h-9 shrink-0 items-center rounded-ctrl border px-3 text-xs font-semibold',
                      'border-primary/40 bg-primary/10 text-primary-text hover:bg-primary/20',
                    )}
                  >
                    {f.fixAction.label}
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function FindingsList({ grade, scannedAt, findings }: {
  grade: string; scannedAt: string; findings: Finding[];
}) {
  const bySeverity = (s: Severity) => findings.filter((f) => f.severity === s);
  const criticals = bySeverity('critical');
  const warnings = bySeverity('warning');
  const infos = bySeverity('info');

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <ScanLine aria-hidden className="size-4 text-primary-text" />
            Scan findings
          </span>
        }
        description={`Each finding links to the control that resolves it · scanned ${relativeTime(scannedAt)}`}
        action={<Badge tone={criticals.length ? 'critical' : 'success'}>Grade {grade}</Badge>}
      />
      {findings.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<ShieldCheck className="size-7" />}
            title="No findings"
            description="This server passed every check in the last scan. Re-run a scan after any staff or permission change."
          />
        </div>
      ) : (
        <>
          <Group severity="critical" findings={criticals} defaultOpen />
          <Group severity="warning" findings={warnings} defaultOpen />
          <Group severity="info" findings={infos} defaultOpen={false} />
        </>
      )}
    </Card>
  );
}
