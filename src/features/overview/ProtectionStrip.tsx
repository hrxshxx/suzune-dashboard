import { Link } from 'react-router-dom';
import { Shield, ShieldOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/cn';
import type { ProtectionState } from '../../api/types';

export function ProtectionStrip({ items }: { items: ProtectionState[] }) {
  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Protection</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((p) => {
          const tone = p.enabled
            ? p.tone === 'critical' ? 'text-critical-text' : 'text-success-text'
            : 'text-muted';
          return (
            <li key={p.key}>
              <Link
                to={p.href}
                className="flex min-h-11 items-center gap-2.5 rounded-ctrl border border-border bg-elevated px-3 py-2 hover:bg-hover"
              >
                {p.enabled
                  ? <Shield aria-hidden className={cn('size-4 shrink-0', tone)} />
                  : <ShieldOff aria-hidden className="size-4 shrink-0 text-muted" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.label}</span>
                  <span className={cn('block text-xs font-semibold', tone)}>
                    {p.enabled ? 'On' : 'Off'}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
