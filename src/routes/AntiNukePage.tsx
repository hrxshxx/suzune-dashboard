import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, AlertTriangle, Check, CircleDot, ShieldCheck, X, Zap } from 'lucide-react';
import { api, qk } from '../api/client';
import type { AntinukeConfig, Punishment } from '../api/types';
import { LIMITS, PUNISHMENTS, detectPreset, presetThresholds, raidSentence } from '../lib/antinuke';
import { useAntinuke, useChannels, useOverview, useRoles } from '../hooks/useGuildQueries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Select } from '../components/ui/Select';
import { Stepper } from '../components/ui/Stepper';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { InfoHint } from '../components/ui/InfoHint';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';
import { ThresholdTable } from '../features/antinuke/ThresholdTable';
import { WhitelistSection } from '../features/antinuke/WhitelistSection';

function Section({ id, title, description, children, tone = 'default' }: {
  id: string; title: string; description?: string;
  children: React.ReactNode; tone?: 'default' | 'critical';
}) {
  return (
    <Card as="section" id={id} tone={tone} className="scroll-mt-24 p-5">
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="mt-1 max-w-prose text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function ReadinessChips({ guildId, punishment }: { guildId: string; punishment: Punishment }) {
  const { data } = useOverview(guildId);
  if (!data) return <Skeleton className="h-11 w-full" />;
  const r = data.readiness;
  const permLabel = PUNISHMENTS.find((p) => p.value === punishment)?.requires ?? 'Ban Members';

  const checks = [
    { label: 'View Audit Log', ok: r.viewAuditLog, why: 'Without it Suzune cannot attribute actions to an executor, so detection never fires.' },
    { label: `${permLabel} permission`, ok: r.punishPermission, why: 'Suzune can detect a breach but cannot carry out the punishment.' },
    { label: 'Role above members', ok: r.roleAboveMembers, why: 'Discord blocks acting on anyone ranked higher than the bot.' },
    { label: 'Bot online', ok: r.botPresent, why: 'Suzune must be in the server and connected.' },
  ];

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {checks.map((c) => (
        <li
          key={c.label}
          title={c.ok ? undefined : c.why}
          className={cn(
            'flex items-center gap-2.5 rounded-ctrl border bg-elevated px-3 py-2.5',
            c.ok ? 'border-border' : 'border-critical/50',
          )}
        >
          {c.ok
            ? <Check aria-hidden className="size-4 shrink-0 text-success-text" />
            : <X aria-hidden className="size-4 shrink-0 text-critical-text" />}
          <span className="text-sm">{c.label}</span>
          <span className="sr-only">{c.ok ? 'ready' : `not ready — ${c.why}`}</span>
        </li>
      ))}
    </ul>
  );
}

export function AntiNukePage() {
  const { guildId = '' } = useParams();
  const { data: saved, isPending, isError, error, refetch } = useAntinuke(guildId);
  const { data: channels } = useChannels(guildId);
  const { data: roles } = useRoles(guildId);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [draft, setDraft] = useState<AntinukeConfig | null>(null);
  const [confirm, setConfirm] = useState<null | 'disable' | 'panic'>(null);
  const [panicWord, setPanicWord] = useState('');
  const panicRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (saved) setDraft(saved); }, [saved]);

  const dirty = useMemo(
    () => Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved)),
    [draft, saved],
  );

  // Warn before losing unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (next: AntinukeConfig) => api.patchAntinuke(guildId, next),
    onSuccess: (result) => {
      qc.setQueryData(qk.antinuke(guildId), result);
      void qc.invalidateQueries({ queryKey: qk.overview(guildId) });
      void qc.invalidateQueries({ queryKey: qk.scan(guildId) });
      toast({ tone: 'success', title: 'Changes saved', description: 'Suzune is enforcing the new configuration.' });
    },
    onError: (e: Error) => {
      toast({
        tone: 'error', title: 'Could not save', description: e.message,
        action: { label: 'Retry', onClick: () => draft && save.mutate(draft) },
      });
    },
  });

  /** Panic mode saves immediately — it is a break-glass control, not a draft. */
  const panic = useMutation({
    mutationFn: (on: boolean) => api.patchAntinuke(guildId, { panicMode: on }),
    onMutate: async (on) => {
      await qc.cancelQueries({ queryKey: qk.antinuke(guildId) });
      const prev = qc.getQueryData<AntinukeConfig>(qk.antinuke(guildId));
      if (prev) qc.setQueryData(qk.antinuke(guildId), { ...prev, panicMode: on });
      setDraft((d) => (d ? { ...d, panicMode: on } : d));
      return { prev };
    },
    onError: (e: Error, _on, ctx) => {
      // Optimistic UI with rollback.
      if (ctx?.prev) {
        qc.setQueryData(qk.antinuke(guildId), ctx.prev);
        setDraft(ctx.prev);
      }
      toast({ tone: 'error', title: 'Panic mode unchanged', description: e.message });
    },
    onSuccess: (result) => {
      qc.setQueryData(qk.antinuke(guildId), result);
      setDraft(result);
      void qc.invalidateQueries({ queryKey: qk.overview(guildId) });
      toast({
        tone: result.panicMode ? 'error' : 'success',
        title: result.panicMode ? 'Panic mode enabled' : 'Panic mode disabled',
        description: result.panicMode
          ? 'Any single destructive action now trips Anti-Nuke.'
          : 'Normal thresholds are back in force.',
      });
    },
  });

  const testAlert = useMutation({
    mutationFn: () => api.testAlert(guildId),
    onSuccess: () => toast({ tone: 'success', title: 'Test alert sent', description: 'Check the channel you selected.' }),
    onError: (e: Error) => toast({ tone: 'error', title: 'Could not send test alert', description: e.message }),
  });

  if (isError) {
    return (
      <Card tone="critical" className="p-5">
        <p className="font-semibold text-critical-text">Could not load Anti-Nuke settings</p>
        <p className="mt-1 text-sm text-muted">{(error as Error).message}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>Try again</Button>
      </Card>
    );
  }

  if (isPending || !draft) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56" />
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-40 w-full rounded-card" />)}
      </div>
    );
  }

  const patch = (p: Partial<AntinukeConfig>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const preset = detectPreset(draft.thresholds);

  return (
    <div className="space-y-5 pb-28">
      <header>
        <h1 className="text-xl font-bold tracking-tight">Anti-Nuke</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Audit-log driven protection. Detection is{' '}
          <strong className="font-semibold text-text">near-real-time, not instant</strong> — expect a
          short delay between an action and its punishment.
        </p>
      </header>

      <Section
        id="master"
        title="Protection"
        description="Watches destructive actions per executor and punishes on threshold breach. The guild owner and Suzune itself are always exempt."
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[14rem] flex-1">
            <p className="text-sm font-semibold">Enable Anti-Nuke</p>
            <p className="mt-0.5 text-sm text-muted">
              {draft.enabled ? 'Destructive actions are being watched.' : 'Nothing is being watched right now.'}
            </p>
          </div>
          <Toggle
            label="Enable Anti-Nuke"
            checked={draft.enabled}
            onChange={(next) => (next ? patch({ enabled: true }) : setConfirm('disable'))}
          />
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[14rem] flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold">Auto-revert</p>
                <InfoHint label="auto-revert">
                  When a trigger fires, Suzune undoes what it can — recreating deleted channels and
                  roles, and removing webhooks that were just added. Some actions cannot be undone.
                </InfoHint>
              </div>
              <p className="mt-0.5 text-sm text-muted">Undo the destructive change where possible.</p>
            </div>
            <Toggle label="Auto-revert" checked={draft.autoRevert} onChange={(v) => patch({ autoRevert: v })} />
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Readiness</p>
          <ReadinessChips guildId={guildId} punishment={draft.punishment} />
        </div>
      </Section>

      <Section
        id="punishment"
        title="Punishment"
        description="Applied to any executor who breaches a threshold below."
      >
        <div role="radiogroup" aria-label="Punishment" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PUNISHMENTS.map((p) => {
            const selected = draft.punishment === p.value;
            return (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => patch({ punishment: p.value })}
                className={cn(
                  'rounded-ctrl border p-3.5 text-left transition-colors duration-fast',
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-elevated hover:bg-hover',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {p.label}
                  {selected && <Check aria-hidden className="ml-auto size-4 text-primary-text" />}
                </span>
                <span className="mt-1 block text-xs text-muted">{p.consequence}</span>
                <span className="mt-2 block font-mono text-[11px] text-muted">Needs: {p.requires}</span>
              </button>
            );
          })}
        </div>

        {draft.punishment === 'quarantine' && (
          <div className="mt-4 rounded-ctrl bg-elevated p-4">
            <Select
              label="Quarantine role"
              description="Applied in place of the executor's roles, so you can review before deciding."
              value={draft.quarantineRoleId ?? ''}
              placeholder="Select a role…"
              onChange={(v) => patch({ quarantineRoleId: v || null })}
              options={(roles ?? []).map((r) => ({ value: r.id, label: r.name }))}
              className="max-w-sm"
            />
            {!draft.quarantineRoleId && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-critical-text">
                <AlertTriangle aria-hidden className="size-3.5" />
                Quarantine cannot be applied until a role is chosen.
              </p>
            )}
          </div>
        )}
      </Section>

      <ThresholdTable
        thresholds={draft.thresholds}
        punishment={draft.punishment}
        panicMode={draft.panicMode}
        preset={preset}
        onChange={(thresholds) => patch({ thresholds })}
        onPreset={(name) => patch({ thresholds: presetThresholds(name) })}
      />

      <Section id="antiraid" title="Anti-raid" description="Detects join spikes and kicks new joiners during a raid.">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[14rem] flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Zap aria-hidden className="size-4 text-warning-text" />
              Enable anti-raid
            </p>
          </div>
          <Toggle label="Enable anti-raid" checked={draft.antiRaidEnabled} onChange={(v) => patch({ antiRaidEnabled: v })} />
        </div>

        {draft.antiRaidEnabled && (
          <div className="mt-4 flex flex-wrap items-end gap-5 border-t border-border pt-4">
            <Stepper
              label="Join count" unit="members"
              value={draft.raidJoinCount}
              min={LIMITS.raidJoinCount.min} max={LIMITS.raidJoinCount.max}
              onChange={(v) => patch({ raidJoinCount: v })}
            />
            <Stepper
              label="Window" unit="seconds"
              value={draft.raidWindowSec}
              min={LIMITS.raidWindowSec.min} max={LIMITS.raidWindowSec.max}
              onChange={(v) => patch({ raidWindowSec: v })}
            />
            <p className="min-w-[14rem] flex-1 pb-1 text-sm text-muted">
              {raidSentence(draft.raidJoinCount, draft.raidWindowSec, draft.antiRaidEnabled)}
            </p>
          </div>
        )}
      </Section>

      <WhitelistSection
        guildId={guildId}
        limitsEnabled={draft.whitelistLimitEnabled}
        onLimitsEnabledChange={(v) => patch({ whitelistLimitEnabled: v })}
      />

      <Section id="alert" title="Alert channel" description="Where Suzune posts every trigger, punishment and auto-revert.">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Channel"
            value={draft.alertChannelId ?? ''}
            placeholder="No channel selected"
            onChange={(v) => patch({ alertChannelId: v || null })}
            options={(channels ?? []).filter((c) => c.type === 'text').map((c) => ({ value: c.id, label: `#${c.name}` }))}
            className="max-w-sm flex-1"
          />
          <Button
            variant="secondary"
            disabled={!draft.alertChannelId || dirty}
            loading={testAlert.isPending}
            onClick={() => testAlert.mutate()}
            title={dirty ? 'Save your changes before sending a test' : undefined}
          >
            Send test alert
          </Button>
        </div>
      </Section>

      <Section
        id="panic"
        tone="critical"
        title="Panic mode — danger zone"
        description="A break-glass control. While active, any single destructive action trips Anti-Nuke and punishes the executor immediately. Expect false positives."
      >
        <div className="flex flex-wrap items-center gap-3">
          {draft.panicMode ? (
            <>
              <Button variant="secondary" loading={panic.isPending} onClick={() => panic.mutate(false)}>
                Disable panic mode
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-critical-text">
                <AlertOctagon aria-hidden className="size-4" /> Currently active
              </span>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={() => { setPanicWord(''); setConfirm('panic'); }}>
                <AlertOctagon aria-hidden className="size-4" /> Enable panic mode
              </Button>
              <span className="text-xs text-muted">Requires typed confirmation.</span>
            </>
          )}
        </div>
      </Section>

      {/* Sticky save bar — appears the moment anything is dirty. */}
      {dirty && (
        <div
          role="region"
          aria-label="Unsaved changes"
          className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-3 border-t border-border bg-elevated/95 p-3 backdrop-blur-md animate-slide-up sm:bottom-4 sm:left-1/2 sm:inset-x-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-pill sm:border sm:px-5 sm:shadow-modal"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <CircleDot aria-hidden className="size-4 text-warning-text" />
            You have unsaved changes
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => saved && setDraft(saved)} disabled={save.isPending}>
              Discard
            </Button>
            <Button variant="primary" loading={save.isPending} onClick={() => save.mutate(draft)}>
              Save changes
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={confirm === 'disable'}
        onClose={() => setConfirm(null)}
        tone="danger"
        icon={<ShieldCheck aria-hidden className="size-5" />}
        title="Turn off Anti-Nuke?"
        description="Destructive actions will stop being watched entirely. Nobody will be stopped from deleting channels, deleting roles or mass-banning members."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { patch({ enabled: false }); setConfirm(null); }}>
              Turn it off
            </Button>
          </>
        }
      />

      <Modal
        open={confirm === 'panic'}
        onClose={() => setConfirm(null)}
        tone="danger"
        icon={<AlertOctagon aria-hidden className="size-5" />}
        title="Enable panic mode?"
        description="Every threshold collapses to one. A single channel deletion by any non-whitelisted member will punish them immediately."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={panicWord !== 'PANIC'}
              onClick={() => { panic.mutate(true); setConfirm(null); }}
            >
              Enable panic mode
            </Button>
          </>
        }
      >
        <label htmlFor="panic-confirm" className="text-xs font-semibold text-muted">
          Type <span className="font-mono text-critical-text">PANIC</span> to confirm
        </label>
        <input
          id="panic-confirm"
          ref={panicRef}
          value={panicWord}
          onChange={(e) => setPanicWord(e.target.value)}
          className="mt-1.5 h-11 w-full rounded-ctrl border border-border-strong bg-elevated px-3 font-mono text-sm"
          autoComplete="off"
        />
      </Modal>
    </div>
  );
}
