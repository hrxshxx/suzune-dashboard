import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ShieldOff, Trash2, User, Users } from 'lucide-react';
import { api, qk } from '../../api/client';
import type { WhitelistEntry } from '../../api/types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { InfoHint } from '../../components/ui/InfoHint';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/format';

export function WhitelistSection({
  guildId, limitsEnabled, onLimitsEnabledChange,
}: {
  guildId: string;
  limitsEnabled: boolean;
  onLimitsEnabledChange: (next: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [picking, setPicking] = useState(false);
  const [removing, setRemoving] = useState<WhitelistEntry | null>(null);

  const list = useQuery({ queryKey: qk.whitelist(guildId), queryFn: () => api.getWhitelist(guildId) });
  const candidates = useQuery({
    queryKey: qk.candidates(guildId),
    queryFn: () => api.getWhitelistCandidates(guildId),
    enabled: picking,
  });

  const add = useMutation({
    mutationFn: (v: { targetId: string; type: 'user' | 'role' }) =>
      api.addWhitelist(guildId, v.targetId, v.type),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.whitelist(guildId) });
      void qc.invalidateQueries({ queryKey: qk.candidates(guildId) });
      void qc.invalidateQueries({ queryKey: qk.scan(guildId) });
      setPicking(false);
      toast({ tone: 'success', title: 'Added to whitelist' });
    },
    onError: (e: Error) => toast({ tone: 'error', title: 'Could not add entry', description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (entryId: string) => api.removeWhitelist(guildId, entryId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.whitelist(guildId) });
      void qc.invalidateQueries({ queryKey: qk.candidates(guildId) });
      void qc.invalidateQueries({ queryKey: qk.scan(guildId) });
      setRemoving(null);
      toast({ tone: 'success', title: 'Removed from whitelist' });
    },
    onError: (e: Error) => toast({ tone: 'error', title: 'Could not remove entry', description: e.message }),
  });

  const entries = (list.data ?? []).filter((e) =>
    e.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Card as="section" id="whitelist" className="scroll-mt-24 p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-[12rem] flex-1">
          <h2 className="text-base font-bold">Whitelist</h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            Trusted users and roles bypass detection entirely. The guild owner and Suzune itself are
            always exempt and do not need an entry.
          </p>
        </div>
        <Button variant="primary" onClick={() => setPicking(true)}>
          <Plus aria-hidden className="size-4" /> Add
        </Button>
      </div>

      {list.isPending ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : entries.length === 0 && !search ? (
        <div className="mt-4">
          <EmptyState
            icon={<Users className="size-7" />}
            title="No trusted users or roles yet"
            description="Whitelist the people who legitimately make sweeping changes — senior admins, bot developers — so routine work never trips Anti-Nuke and locks them out."
            action={
              <Button variant="primary" onClick={() => setPicking(true)}>
                <Plus aria-hidden className="size-4" /> Add first entry
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="relative mt-4">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search whitelist…"
              aria-label="Search whitelist"
              className="h-11 w-full rounded-ctrl border border-border-strong bg-elevated pl-9 pr-3 text-sm"
            />
          </div>

          <ul className="mt-3 overflow-hidden rounded-ctrl border border-border">
            {entries.length === 0 ? (
              <li className="p-4 text-center text-sm text-muted">
                Nothing matches “{search}”.
              </li>
            ) : entries.map((e) => (
              <li key={e.id} className="flex items-center gap-3 border-b border-border p-3 last:border-b-0">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-ctrl bg-primary/10 text-primary-text">
                  {e.type === 'role' ? <Users className="size-4" /> : <User className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {e.name}{' '}
                    <span className="ml-1 rounded-pill bg-elevated px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      {e.type}
                    </span>
                  </p>
                  <p className="truncate font-mono text-xs text-muted">
                    added by {e.addedByName} · {formatDate(e.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost" size="sm"
                  aria-label={`Remove ${e.name} from whitelist`}
                  onClick={() => setRemoving(e)}
                  className="text-muted hover:text-critical-text"
                >
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Nested, visually subordinate — this is the most confusing concept in the product. */}
      <div className="mt-5 rounded-ctrl border border-dashed border-border bg-elevated p-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-[14rem] flex-1">
            <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
              Whitelist limits
              <InfoHint label="whitelist limits">
                Whitelisted accounts normally bypass Anti-Nuke completely. With limits on they are
                still trusted for everyday work, but a separate, higher limit still catches them —
                so a senior admin whose account gets compromised and deletes 30 channels is stopped,
                while their routine changes are not.
              </InfoHint>
            </p>
            <p className="mt-1 max-w-prose text-sm text-muted">
              Trusted, but not unlimited. When on, whitelisted accounts are{' '}
              <em>still</em> tripped above a separate, higher limit.
            </p>
          </div>
          <Toggle label="Enable whitelist limits" checked={limitsEnabled} onChange={onLimitsEnabledChange} />
        </div>
      </div>

      <Modal
        open={picking}
        onClose={() => setPicking(false)}
        title="Add to whitelist"
        description="Whitelisted roles and users bypass Anti-Nuke detection."
        icon={<Plus aria-hidden className="size-5" />}
      >
        {candidates.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (candidates.data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Everything is already whitelisted.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto rounded-ctrl border border-border">
            {(candidates.data ?? []).map((c) => (
              <li key={c.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  disabled={add.isPending}
                  onClick={() => add.mutate({ targetId: c.id, type: c.type })}
                  className="flex min-h-11 w-full items-center gap-3 p-3 text-left hover:bg-hover disabled:opacity-50"
                >
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-ctrl bg-primary/10 text-primary-text">
                    {c.type === 'role' ? <Users className="size-4" /> : <User className="size-4" />}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{c.name}</span>
                  <Plus aria-hidden className="size-4 text-primary-text" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        tone="danger"
        icon={<ShieldOff aria-hidden className="size-5" />}
        title="Remove from whitelist?"
        description={
          removing
            ? `${removing.name} will be subject to Anti-Nuke detection again, and can be punished for exceeding a threshold.`
            : ''
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => removing && remove.mutate(removing.id)}
            >
              Remove
            </Button>
          </>
        }
      />
    </Card>
  );
}
