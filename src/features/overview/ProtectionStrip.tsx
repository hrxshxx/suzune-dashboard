import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import type { ProtectionState } from '../../api/types';

/** Each protection's state, linking to the control that changes it. */
export function ProtectionStrip({ items }: { items: ProtectionState[] }) {
  const on = items.filter((p) => p.enabled).length;
  return (
    <section aria-labelledby="prot-h" className="rounded-card border border-border bg-surface">
      <div className="flex h-11 items-center gap-2 border-b border-border px-4">
        <h2 id="prot-h" className="font-semibold">Protections</h2>
        <span className="flex-1" />
        <span className="font-mono text-xs text-faint">{on} on</span>
      </div>
      <ul className="m-0 list-none p-0">
        {items.map((p) => (
          <li key={p.key} className="border-t border-border first:border-t-0">
            <Link to={p.href} className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-fast hover:bg-hover">
              <span className="min-w-0 flex-1 font-medium">{p.label}</span>
              {p.enabled
                ? <Badge tone={p.tone === 'critical' ? 'critical' : 'success'} dot>On</Badge>
                : <Badge dot>Off</Badge>}
              <ChevronRight aria-hidden className="size-4 text-faint" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
