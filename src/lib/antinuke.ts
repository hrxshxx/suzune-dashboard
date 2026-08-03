/**
 * Anti-Nuke domain constants — the watched action table, punishments and
 * threshold presets. Kept in one place so the read-back sentences, the preset
 * maths and the mock data can never disagree.
 */
import type { ActionKey, Punishment, ThresholdMap, Threshold } from '../api/types';

export interface ActionMeta {
  key: ActionKey;
  label: string;
  /** Slots into "…who {verb} within {n}s". `{n}` is the limit. */
  phrase: (limit: number) => string;
  baseLimit: number;
  baseWindow: number;
  group: 'structure' | 'members' | 'integrations' | 'identity';
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const ACTIONS: ActionMeta[] = [
  {
    key: 'ban', label: 'Mass ban', group: 'members',
    phrase: (n) => `bans ${n} ${plural(n, 'member', 'members')}`,
    baseLimit: 5, baseWindow: 15,
  },
  {
    key: 'kick', label: 'Mass kick', group: 'members',
    phrase: (n) => `kicks ${n} ${plural(n, 'member', 'members')}`,
    baseLimit: 5, baseWindow: 15,
  },
  {
    key: 'prune', label: 'Member prune', group: 'members',
    phrase: (n) => `prunes members ${n} ${plural(n, 'time', 'times')}`,
    baseLimit: 1, baseWindow: 30,
  },
  {
    key: 'channelCreate', label: 'Channel create', group: 'structure',
    phrase: (n) => `creates ${n} ${plural(n, 'channel', 'channels')}`,
    baseLimit: 5, baseWindow: 20,
  },
  {
    key: 'channelDelete', label: 'Channel delete', group: 'structure',
    phrase: (n) => `deletes ${n} ${plural(n, 'channel', 'channels')}`,
    baseLimit: 3, baseWindow: 10,
  },
  {
    key: 'channelUpdate', label: 'Channel update', group: 'structure',
    phrase: (n) => `edits ${n} ${plural(n, 'channel', 'channels')}`,
    baseLimit: 6, baseWindow: 20,
  },
  {
    key: 'roleCreate', label: 'Role create', group: 'structure',
    phrase: (n) => `creates ${n} ${plural(n, 'role', 'roles')}`,
    baseLimit: 5, baseWindow: 20,
  },
  {
    key: 'roleDelete', label: 'Role delete', group: 'structure',
    phrase: (n) => `deletes ${n} ${plural(n, 'role', 'roles')}`,
    baseLimit: 3, baseWindow: 10,
  },
  {
    key: 'roleUpdateDangerous', label: 'Role grants admin', group: 'structure',
    phrase: (n) => `grants dangerous permissions ${n} ${plural(n, 'time', 'times')}`,
    baseLimit: 2, baseWindow: 15,
  },
  {
    key: 'webhookCreate', label: 'Webhook create', group: 'integrations',
    phrase: (n) => `creates ${n} ${plural(n, 'webhook', 'webhooks')}`,
    baseLimit: 5, baseWindow: 20,
  },
  {
    key: 'webhookDelete', label: 'Webhook delete', group: 'integrations',
    phrase: (n) => `deletes ${n} ${plural(n, 'webhook', 'webhooks')}`,
    baseLimit: 3, baseWindow: 15,
  },
  {
    key: 'botAdd', label: 'Bot added', group: 'integrations',
    phrase: (n) => `adds ${n} ${plural(n, 'bot', 'bots')}`,
    baseLimit: 1, baseWindow: 60,
  },
  {
    key: 'guildUpdate', label: 'Server settings change', group: 'identity',
    phrase: (n) => `changes server settings ${n} ${plural(n, 'time', 'times')}`,
    baseLimit: 3, baseWindow: 30,
  },
  {
    key: 'emojiDelete', label: 'Emoji delete', group: 'identity',
    phrase: (n) => `deletes ${n} ${plural(n, 'emoji', 'emojis')}`,
    baseLimit: 5, baseWindow: 30,
  },
  {
    key: 'stickerDelete', label: 'Sticker delete', group: 'identity',
    phrase: (n) => `deletes ${n} ${plural(n, 'sticker', 'stickers')}`,
    baseLimit: 5, baseWindow: 30,
  },
];

export const ACTION_KEYS = ACTIONS.map((a) => a.key);
export const ACTION_BY_KEY = Object.fromEntries(
  ACTIONS.map((a) => [a.key, a]),
) as Record<ActionKey, ActionMeta>;

export const GROUP_LABELS: Record<ActionMeta['group'], string> = {
  structure: 'Server structure',
  members: 'Members',
  integrations: 'Integrations',
  identity: 'Server identity',
};

export interface PunishmentMeta {
  value: Punishment;
  label: string;
  /** One line saying exactly what happens — nobody should guess what "strip" does. */
  consequence: string;
  /** The Discord permission the bot needs to carry this out. */
  requires: string;
}

export const PUNISHMENTS: PunishmentMeta[] = [
  {
    value: 'ban', label: 'Ban',
    consequence: 'Removes the executor from the server permanently. They cannot rejoin.',
    requires: 'Ban Members',
  },
  {
    value: 'kick', label: 'Kick',
    consequence: 'Removes the executor. They can return with a new invite.',
    requires: 'Kick Members',
  },
  {
    value: 'strip', label: 'Strip roles',
    consequence: 'Removes every one of their roles, leaving the account powerless but still present.',
    requires: 'Manage Roles',
  },
  {
    value: 'quarantine', label: 'Quarantine',
    consequence: 'Replaces their roles with a quarantine role so you can review before deciding.',
    requires: 'Manage Roles',
  },
  {
    value: 'removeperms', label: 'Remove perms',
    consequence: 'Removes only the roles carrying dangerous permissions, keeping cosmetic ones.',
    requires: 'Manage Roles',
  },
];

export type PresetName = 'strict' | 'balanced' | 'lenient' | 'custom';

/**
 * Balanced is the base table. Strict tightens, Lenient loosens. Kept identical
 * to the bot so a preset chosen here means the same thing there.
 */
export function presetThresholds(preset: Exclude<PresetName, 'custom'>): ThresholdMap {
  const out = {} as ThresholdMap;
  for (const a of ACTIONS) {
    let limit = a.baseLimit;
    let windowSec = a.baseWindow;
    if (preset === 'strict') {
      limit = Math.max(1, Math.ceil(a.baseLimit * 0.5));
      windowSec = Math.max(5, Math.round(a.baseWindow * 0.7));
    } else if (preset === 'lenient') {
      limit = Math.round(a.baseLimit * 1.7);
      windowSec = Math.round(a.baseWindow * 1.5);
    }
    out[a.key] = { enabled: true, limit, windowSec };
  }
  return out;
}

/** Which preset a table currently matches, or 'custom' once the user drifts. */
export function detectPreset(thresholds: ThresholdMap): PresetName {
  for (const name of ['balanced', 'strict', 'lenient'] as const) {
    const preset = presetThresholds(name);
    const same = ACTION_KEYS.every((k) => {
      const a = thresholds[k];
      const b = preset[k];
      return a && b && a.enabled === b.enabled && a.limit === b.limit && a.windowSec === b.windowSec;
    });
    if (same) return name;
  }
  return 'custom';
}

export const LIMITS = {
  limit: { min: 1, max: 100 },
  windowSec: { min: 1, max: 600 },
  raidJoinCount: { min: 2, max: 100 },
  raidWindowSec: { min: 5, max: 600 },
} as const;

/** The English read-back shown under every threshold row. */
export function ruleSentence(
  key: ActionKey,
  threshold: Threshold,
  punishment: Punishment,
  panicMode: boolean,
): string {
  if (!threshold.enabled) return 'Not watched — this action is ignored entirely.';
  const meta = ACTION_BY_KEY[key];
  const verb = PUNISHMENTS.find((p) => p.value === punishment)?.label ?? 'Punish';
  if (panicMode) {
    return `${verb} any executor who ${meta.phrase(1)} — panic mode overrides this limit.`;
  }
  return `${verb} any executor who ${meta.phrase(threshold.limit)} within ${threshold.windowSec} seconds.`;
}

export function raidSentence(joinCount: number, windowSec: number, enabled: boolean): string {
  if (!enabled) return 'Join spikes are not being watched.';
  return `Trigger anti-raid when ${joinCount} members join within ${windowSec} seconds.`;
}

export const TIER_ORDER = ['AT RISK', 'ELEVATED', 'GUARDED', 'PROTECTED'] as const;

/** Thresholds copied from the bot's integrityTier() — must not drift. */
export function tierForScore(score: number): 'PROTECTED' | 'GUARDED' | 'ELEVATED' | 'AT RISK' {
  if (score >= 90) return 'PROTECTED';
  if (score >= 70) return 'GUARDED';
  if (score >= 40) return 'ELEVATED';
  return 'AT RISK';
}
