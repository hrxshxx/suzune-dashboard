import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { Stepper } from '../../components/ui/Stepper';
import { InfoHint } from '../../components/ui/InfoHint';
import { cn } from '../../lib/cn';
import {
  ACTIONS, GROUP_LABELS, LIMITS, ruleSentence, type PresetName,
} from '../../lib/antinuke';
import type { ActionKey, Punishment, ThresholdMap } from '../../api/types';

const PRESETS: Exclude<PresetName, 'custom'>[] = ['strict', 'balanced', 'lenient'];

export function ThresholdTable({
  thresholds, punishment, panicMode, preset, onChange, onPreset,
}: {
  thresholds: ThresholdMap;
  punishment: Punishment;
  panicMode: boolean;
  preset: PresetName;
  onChange: (next: ThresholdMap) => void;
  onPreset: (name: Exclude<PresetName, 'custom'>) => void;
}) {
  const update = (key: ActionKey, patch: Partial<ThresholdMap[ActionKey]>) =>
    onChange({ ...thresholds, [key]: { ...thresholds[key], ...patch } });

  const groups = Array.from(new Set(ACTIONS.map((a) => a.group)));

  return (
    <Card as="section" id="thresholds" className="scroll-mt-24 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[12rem] flex-1">
          <h2 className="flex items-center gap-1.5 text-base font-bold">
            Thresholds
            <InfoHint label="thresholds">
              Each row watches one destructive action. If a single executor exceeds the limit inside
              the window, Suzune applies the punishment. Turning a row off means that action is
              ignored entirely — even in panic mode.
            </InfoHint>
          </h2>
          <p className="mt-1 text-sm text-muted">
            Limits apply per executor, inside a sliding window.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div role="group" aria-label="Threshold preset" className="flex rounded-pill bg-elevated p-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={preset === p}
                onClick={() => onPreset(p)}
                className={cn(
                  'min-h-9 rounded-pill px-3.5 text-xs font-semibold capitalize transition-colors duration-fast',
                  preset === p ? 'bg-primary text-white' : 'text-muted hover:text-text',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Badge tone={preset === 'custom' ? 'warning' : 'primary'}>
            {preset === 'custom' ? 'Custom' : preset}
          </Badge>
        </div>
      </div>

      {panicMode && (
        <p className="mt-4 rounded-ctrl border border-critical/40 bg-critical/10 p-3 text-sm text-critical-text">
          Panic mode is on — every limit below is overridden to 1 until you turn it off.
        </p>
      )}

      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {GROUP_LABELS[group]}
            </h3>
            <ul className="space-y-2">
              {ACTIONS.filter((a) => a.group === group).map((action) => {
                const t = thresholds[action.key];
                if (!t) return null;
                return (
                  <li
                    key={action.key}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-ctrl border border-border bg-elevated p-3"
                  >
                    <Toggle
                      label={`Watch ${action.label}`}
                      checked={t.enabled}
                      onChange={(v) => update(action.key, { enabled: v })}
                    />
                    <div className="min-w-[12rem] flex-1">
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className={cn('mt-0.5 text-xs', t.enabled ? 'text-muted' : 'text-muted/70')}>
                        {ruleSentence(action.key, t, punishment, panicMode)}
                      </p>
                    </div>
                    <div className={cn('flex items-end gap-3', !t.enabled && 'opacity-40')}>
                      <Stepper
                        label={`${action.label} limit`} unit="limit"
                        value={t.limit}
                        min={LIMITS.limit.min} max={LIMITS.limit.max}
                        disabled={!t.enabled}
                        onChange={(v) => update(action.key, { limit: v })}
                      />
                      <Stepper
                        label={`${action.label} window in seconds`} unit="window (s)"
                        value={t.windowSec}
                        min={LIMITS.windowSec.min} max={LIMITS.windowSec.max}
                        disabled={!t.enabled}
                        onChange={(v) => update(action.key, { windowSec: v })}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
