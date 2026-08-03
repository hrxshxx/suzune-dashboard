import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Tier } from '../../api/types';

const TIER_TONE: Record<Tier, BadgeTone> = {
  PROTECTED: 'success',
  GUARDED: 'primary',
  ELEVATED: 'warning',
  'AT RISK': 'critical',
};

const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function IntegrityHeroSkeleton() {
  return (
    <Card glass className="p-6">
      <div className="flex flex-wrap items-center gap-7">
        <Skeleton className="size-[150px] rounded-pill" />
        <div className="min-w-[200px] flex-1 space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-32 rounded-pill" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </Card>
  );
}

export function IntegrityHero({
  score, tier, verdict, history,
}: {
  score: number; tier: Tier; verdict: string; history: { date: string; value: number }[];
}) {
  // Animate the ring once on mount; respect reduced motion by starting at rest.
  const reduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [progress, setProgress] = useState(reduced ? score : 0);

  useEffect(() => {
    if (reduced) { setProgress(score); return; }
    const id = requestAnimationFrame(() => setProgress(score));
    return () => cancelAnimationFrame(id);
  }, [score, reduced]);

  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <Card glass className="p-6">
      <div className="flex flex-wrap items-center gap-7">
        <div className="relative size-[150px] shrink-0">
          <svg width={150} height={150} viewBox="0 0 150 150" className="-rotate-90" role="img"
               aria-label={`System integrity index ${score} out of 100, tier ${tier}`}>
            <circle cx="75" cy="75" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="12" />
            <circle
              cx="75" cy="75" r={RADIUS} fill="none" stroke="var(--primary)" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 900ms var(--ease)' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums leading-none">{score}</p>
              <p className="mt-1 text-xs text-muted">/ 100</p>
            </div>
          </div>
        </div>

        <div className="min-w-[220px] flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            System integrity index
          </p>
          <div className="mt-2">
            <Badge tone={TIER_TONE[tier]} icon={<ShieldCheck aria-hidden className="size-3.5" />}>
              {tier}
            </Badge>
          </div>
          <p className="mt-3 max-w-prose text-sm leading-relaxed">{verdict}</p>

          {history.length > 1 && (
            <div className="mt-4">
              <p className="mb-1 text-xs text-muted">Last 7 days</p>
              <div className="h-10 w-full max-w-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <YAxis hide domain={[0, 100]} />
                    <Line
                      type="monotone" dataKey="value" stroke="var(--primary)"
                      strokeWidth={2} dot={false} isAnimationActive={!reduced}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
