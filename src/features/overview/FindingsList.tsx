import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, Check, Info } from 'lucide-react';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { buttonClass } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import type { Finding, Severity, Tier } from '../../api/types';

const TIER_TONE: Record<Tier, BadgeTone> = {
  PROTECTED: 'success', GUARDED: 'primary', ELEVATED: 'warning', 'AT RISK': 'critical',
};

const BAR: Record<Tier, string> = {
  PROTECTED: 'bg-success', GUARDED: 'bg-primary', ELEVATED: 'bg-warning', 'AT RISK': 'bg-critical',
};

const SEVERITY: Record<Severity, { label: string; icon: typeof Info; cls: string }> = {
  critical: { label: 'critical', icon: AlertOctagon, cls: 'text-critical-text' },
  warning: { label: 'warning', icon: AlertTriangle, cls: 'text-warning-text' },
  info: { label: 'info', icon: Info, cls: 'text-info-text' },
};
const ORDER: Severity[] = ['critical', 'warning', 'info'];

const rowCls = 'grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-3 border-t border-border px-4 py-3 sm:grid-cols-[16px_minmax(0,1fr)_64px_auto]';

function Header({ count }: { count?: number }) {
  return (
    <div className="flex h-11 items-center gap-2 border-b border-border px-4">
      <h2 id="posture-h" className="font-semibold">Security posture</h2>
      <span className="flex-1" />
      {count !== undefined && (
        <span className="font-mono text-xs text-faint">{count === 0 ? 'no findings' : `${count} to fix`}</span>
      )}
    </div>
  );
}

export function FindingsSkeleton() {
  return (
    <section className="rounded-card border border-border bg-surface">
      <Header />
      <div className="flex items-center gap-4 p-4"><Skeleton className="h-7 w-16" /><Skeleton className="h-2 flex-1" /></div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={rowCls}>
          <Skeleton className="size-4 rounded-full" />
          <div className="flex flex-col gap-1.5"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-2.5 w-4/5" /></div>
        </div>
      ))}
    </section>
  );
}

/** Integrity score, tier and the scan findings that hold it back. */
export function FindingsList({ score, tier, verdict, findings }: {
  score: number; tier: Tier; verdict: string; findings: Finding[];
}) {
  const sorted = [...findings].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity));
  const filled = Math.round(score / 10);
  return (
    <section aria-labelledby="posture-h" className="rounded-card border border-border bg-surface">
      <Header count={findings.length} />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-semibold leading-none tracking-[-0.02em] tabular-nums">{score}</span>
            <span className="font-mono text-xs text-faint">/100</span>
          </div>
          <Badge tone={TIER_TONE[tier]} dot>{tier.charAt(0) + tier.slice(1).toLowerCase()}</Badge>
          <div role="img" aria-label={`Integrity ${score} out of 100`} className="flex h-1.5 flex-[1_1_240px] gap-0.5">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={cn('flex-1 rounded-sm transition-colors duration-base', i < filled ? BAR[tier] : 'bg-elevated-2')}
              />
            ))}
          </div>
        </div>
        <p className="text-muted">{verdict}</p>
      </div>
      {sorted.length === 0 ? (
        <div className={rowCls}>
          <Check aria-hidden className="mt-px size-4 text-success-text" />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">Every check passes</span>
            <span className="text-muted">Re-scan after any staff or permission change.</span>
          </div>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {sorted.map((f) => {
            const s = SEVERITY[f.severity];
            const Icon = s.icon;
            return (
              <li key={f.id} className={rowCls}>
                <Icon role="img" aria-label={s.label} className={cn('mt-px size-4', s.cls)} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium">{f.title}</span>
                  <span className="text-muted">{f.detail}</span>
                </div>
                <span className="mt-px hidden text-right font-mono text-xs text-faint sm:block">{s.label}</span>
                <div className="flex justify-end">
                  {f.fixAction && (
                    <Link to={f.fixAction.href} className={buttonClass('secondary', 'sm')} aria-label={`${f.fixAction.label}: ${f.title}`}>
                      {f.fixAction.label}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
