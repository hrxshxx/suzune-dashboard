/**
 * Mock adapter.
 *
 * `VITE_USE_MOCKS=true` makes `npm run dev` produce a fully populated, fully
 * interactive dashboard with no backend at all. Mutations mutate this in-memory
 * store, so saving, toggling and whitelisting behave exactly as they will
 * against the real API — including a deliberate failure case so the optimistic
 * rollback path is reachable.
 */
import { presetThresholds, ACTIONS, tierForScore } from '../lib/antinuke';
import { FEATURE_SCHEMAS, defaultsFor } from '../lib/featureSchemas';
import type {
  AntinukeConfig, Channel, DiscordUser, Finding, GuildSummary, Overview,
  Role, ScanResult, SecurityEvent, WhitelistCandidate, WhitelistEntry,
  FeatureConfig, FeatureResponse,
} from './types';
import { ApiError } from './types';

const LATENCY = 260;
const delay = <T>(value: T, ms = LATENCY): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const USER: DiscordUser = {
  id: '288100000000000001',
  username: 'hrxshx',
  avatarUrl: null,
};

const GUILDS: GuildSummary[] = [
  { id: '900100000000000001', name: 'Aurora Community', iconUrl: null, memberCount: 12480, canManage: true, botPresent: true, tier: 'GUARDED' },
  { id: '900100000000000002', name: 'Nebula Gaming', iconUrl: null, memberCount: 48120, canManage: true, botPresent: true, tier: 'PROTECTED' },
  { id: '900100000000000003', name: 'Pixel Art Hub', iconUrl: null, memberCount: 3204, canManage: true, botPresent: true, tier: 'ELEVATED' },
  { id: '900100000000000004', name: 'Indie Devs', iconUrl: null, memberCount: 9870, canManage: true, botPresent: true, tier: 'AT RISK' },
  { id: '900100000000000005', name: 'Study Lounge', iconUrl: null, memberCount: 21540, canManage: false, botPresent: true, tier: null },
  { id: '900100000000000006', name: 'Launchpad', iconUrl: null, memberCount: 640, canManage: true, botPresent: false, tier: null },
];

const ROLES: Role[] = [
  { id: '800200000000000001', name: 'Senior Admin', position: 24, color: 0x8b5cf6 },
  { id: '800200000000000002', name: 'Moderator', position: 18, color: 0x60a5fa },
  { id: '800200000000000003', name: 'Bot Developers', position: 15, color: 0x22c55e },
  { id: '800200000000000004', name: 'Trial Mods', position: 11, color: 0xf59e0b },
  { id: '800200000000000005', name: 'Quarantine', position: 4, color: 0xef4444 },
  { id: '800200000000000006', name: 'Member', position: 1, color: 0 },
];

const CHANNELS: Channel[] = [
  { id: '700300000000000001', name: 'security-alerts', type: 'text' },
  { id: '700300000000000002', name: 'mod-log', type: 'text' },
  { id: '700300000000000003', name: 'audit-trail', type: 'text' },
  { id: '700300000000000004', name: 'general', type: 'text' },
  { id: '700300000000000005', name: 'staff-room', type: 'text' },
];

function defaultConfig(guildId: string): AntinukeConfig {
  return {
    guildId,
    enabled: true,
    punishment: 'ban',
    autoRevert: true,
    alertChannelId: '700300000000000001',
    quarantineRoleId: null,
    antiRaidEnabled: true,
    raidJoinCount: 10,
    raidWindowSec: 10,
    panicMode: false,
    autoLockOnTrigger: false,
    thresholds: presetThresholds('balanced'),
    whitelistLimitEnabled: false,
    whitelistLimits: {},
  };
}

/** Mutable in-memory store, so mutations persist for the session. */
const store = {
  configs: new Map<string, AntinukeConfig>(),
  whitelist: new Map<string, WhitelistEntry[]>(),
  features: new Map<string, FeatureConfig>(),
};

function getConfig(guildId: string): AntinukeConfig {
  if (!store.configs.has(guildId)) store.configs.set(guildId, defaultConfig(guildId));
  return store.configs.get(guildId)!;
}

function getWhitelist(guildId: string): WhitelistEntry[] {
  if (!store.whitelist.has(guildId)) {
    store.whitelist.set(guildId, [
      {
        id: 'wl_1', guildId, targetId: '800200000000000001', type: 'role',
        name: 'Senior Admin', addedById: USER.id, addedByName: 'hrxshx',
        createdAt: new Date(Date.now() - 86400000 * 42).toISOString(),
      },
      {
        id: 'wl_2', guildId, targetId: '800200000000000003', type: 'role',
        name: 'Bot Developers', addedById: USER.id, addedByName: 'nova',
        createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      },
    ]);
  }
  return store.whitelist.get(guildId)!;
}

function buildOverview(guildId: string): Overview {
  const guild = GUILDS.find((g) => g.id === guildId) ?? GUILDS[0];
  const cfg = getConfig(guildId);

  // Score is derived from real config state so the mock reacts to edits.
  let score = 100;
  if (!cfg.enabled) score -= 35;
  if (!cfg.antiRaidEnabled) score -= 10;
  if (!cfg.alertChannelId) score -= 6;
  if (cfg.punishment === 'quarantine' && !cfg.quarantineRoleId) score -= 15;
  const off = ACTIONS.filter((a) => !cfg.thresholds[a.key]?.enabled).length;
  score -= Math.min(12, off * 2);
  score = Math.max(0, Math.min(100, score));

  const threatRoles = 1;
  const threatUsers = 0;

  const readiness = {
    botPresent: true,
    viewAuditLog: true,
    punishPermission: cfg.punishment !== 'quarantine' || Boolean(cfg.quarantineRoleId),
    roleAboveMembers: true,
    highestRolePosition: 27,
  };

  return {
    guild,
    integrityIndex: score,
    tier: tierForScore(score),
    verdict:
      score >= 85
        ? 'Your configuration covers the destructive actions that matter. Keep the whitelist tight after staff changes.'
        : score >= 70
          ? 'Core protection is in place, but there are gaps a determined attacker could use. Work through the findings below.'
          : score >= 50
            ? 'Significant gaps remain — several destructive actions are unwatched or cannot be punished.'
            : 'This server is largely unprotected. Start by enabling Anti-Nuke and granting the permissions it needs.',
    metrics: [
      { key: 'roles', label: 'Roles', value: 42, delta: 2 },
      { key: 'adminRoles', label: 'Admin roles', value: 5, delta: 0 },
      { key: 'threatRoles', label: 'Threat roles', value: threatRoles, delta: 1, isThreat: true },
      { key: 'permRisk', label: 'Permission risk', value: threatRoles > 0 ? 'Medium' : 'Low', delta: null },
      { key: 'channels', label: 'Channels', value: 38, delta: -1 },
      { key: 'privileged', label: 'Privileged users', value: 7, delta: 0 },
      { key: 'threatUsers', label: 'Threat users', value: threatUsers, delta: 0, isThreat: true },
      { key: 'integrations', label: 'Integrations', value: 4, delta: 0 },
      { key: 'webhooks', label: 'Webhooks', value: 6, delta: 2 },
      { key: 'members', label: 'Members', value: guild.memberCount, delta: 184 },
    ],
    protection: [
      { key: 'antinuke', label: 'Anti-Nuke', enabled: cfg.enabled, href: `/servers/${guildId}/anti-nuke#master` },
      { key: 'antiraid', label: 'Anti-Raid', enabled: cfg.antiRaidEnabled, href: `/servers/${guildId}/anti-nuke#antiraid` },
      { key: 'automod', label: 'Auto-Mod', enabled: true, href: `/servers/${guildId}/anti-nuke` },
      { key: 'autorevert', label: 'Auto-Revert', enabled: cfg.autoRevert, href: `/servers/${guildId}/anti-nuke#master` },
      { key: 'panic', label: 'Panic Mode', enabled: cfg.panicMode, href: `/servers/${guildId}/anti-nuke#panic`, tone: 'critical' },
      { key: 'modlog', label: 'Mod Logging', enabled: Boolean(cfg.alertChannelId), href: `/servers/${guildId}/anti-nuke#alert` },
    ],
    readiness,
    blocking:
      cfg.punishment === 'quarantine' && !cfg.quarantineRoleId
        ? {
            code: 'missing_punish_perm',
            title: 'Quarantine is selected but no role is chosen',
            detail: 'Suzune can detect a breach but has nothing to apply, so no executor will be stopped.',
            fix: 'Pick a quarantine role in the Punishment section.',
          }
        : null,
    history: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
      value: Math.max(0, Math.min(100, score - 8 + i * 1.4 + (i % 2 ? 2 : -1))),
    })),
  };
}

function buildScan(guildId: string): ScanResult {
  const cfg = getConfig(guildId);
  const findings: Finding[] = [];
  const base = `/servers/${guildId}/anti-nuke`;

  if (!cfg.enabled) {
    findings.push({
      id: 'f_disabled', severity: 'critical',
      title: 'Anti-Nuke is switched off',
      detail: 'Nothing is watching destructive actions. Any administrator can delete every channel without being stopped.',
      fixAction: { label: 'Enable Anti-Nuke', href: `${base}#master` },
    });
  }
  if (cfg.punishment === 'quarantine' && !cfg.quarantineRoleId) {
    findings.push({
      id: 'f_quarantine', severity: 'critical',
      title: 'Quarantine selected with no role chosen',
      detail: 'The punishment cannot be applied until you pick the role Suzune should assign.',
      fixAction: { label: 'Choose a role', href: `${base}#punishment` },
    });
  }
  const off = ACTIONS.filter((a) => !cfg.thresholds[a.key]?.enabled);
  if (off.length) {
    findings.push({
      id: 'f_unwatched', severity: 'warning',
      title: `${off.length} destructive ${off.length === 1 ? 'action is' : 'actions are'} not watched`,
      detail: `Disabled rows are ignored entirely, even in panic mode. Currently off: ${off.map((a) => a.label).join(', ')}.`,
      fixAction: { label: 'Review thresholds', href: `${base}#thresholds` },
    });
  }
  if (!cfg.antiRaidEnabled) {
    findings.push({
      id: 'f_raid', severity: 'warning',
      title: 'Anti-raid is off',
      detail: 'Join spikes are not detected, so a coordinated raid can flood the server unchallenged.',
      fixAction: { label: 'Enable anti-raid', href: `${base}#antiraid` },
    });
  }
  findings.push({
    id: 'f_admins', severity: 'warning',
    title: '2 administrators are not on the whitelist',
    detail: 'kira.dev and @Trial Mods hold Administrator. Routine work by these accounts will trip Anti-Nuke and punish them.',
    fixAction: { label: 'Add to whitelist', href: `${base}#whitelist` },
  });
  if (!cfg.alertChannelId) {
    findings.push({
      id: 'f_alert', severity: 'warning',
      title: 'No alert channel is set',
      detail: 'Triggers and punishments happen silently — nobody is told when Suzune acts.',
      fixAction: { label: 'Pick a channel', href: `${base}#alert` },
    });
  }
  if (!cfg.whitelistLimitEnabled) {
    findings.push({
      id: 'f_wl_limits', severity: 'info',
      title: 'Whitelist limits are off',
      detail: 'Whitelisted accounts bypass detection completely. Turning limits on still catches a trusted account that has been compromised.',
      fixAction: { label: 'Turn on limits', href: `${base}#whitelist` },
    });
  }
  findings.push({
    id: 'f_2fa', severity: 'info',
    title: 'Two-factor authentication is not required for moderators',
    detail: 'Discord can require 2FA for moderation actions, which blocks the most common account-takeover path.',
    fixAction: null,
  });

  const criticals = findings.filter((f) => f.severity === 'critical').length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const grade = criticals > 0 ? 'D' : warnings > 2 ? 'C' : warnings > 0 ? 'B' : 'A';

  return { grade, scannedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), findings };
}

const EVENTS: SecurityEvent[] = [
  { id: 'e1', executorId: '1', executorName: 'raider_9931', action: 'Mass ban', target: '6 members', outcome: 'Banned', outcomeTone: 'critical', createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString() },
  { id: 'e2', executorId: '2', executorName: 'kira.dev', action: 'Channel delete', target: '#archive-2024', outcome: 'Reverted', outcomeTone: 'success', createdAt: new Date(Date.now() - 1000 * 60 * 96).toISOString() },
  { id: 'e3', executorId: '3', executorName: 'lowbudget_ad', action: 'Webhook create', target: 'promo-hook', outcome: 'Quarantined', outcomeTone: 'critical', createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: 'e4', executorId: '4', executorName: 'nova', action: 'Role delete', target: '@Event Team', outcome: 'Allowed (whitelisted)', outcomeTone: 'muted', createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
  { id: 'e5', executorId: '5', executorName: 'mika', action: 'Dangerous permission grant', target: '@Helpers', outcome: 'Stripped roles', outcomeTone: 'warning', createdAt: new Date(Date.now() - 1000 * 60 * 900).toISOString() },
  { id: 'e6', executorId: '6', executorName: 'jonas', action: 'Mass kick', target: '4 members', outcome: 'Kicked', outcomeTone: 'critical', createdAt: new Date(Date.now() - 1000 * 60 * 1500).toISOString() },
];

export const mockApi = {
  getMe: () => delay(USER),
  getGuilds: () => delay(clone(GUILDS)),
  getOverview: (guildId: string) => delay(buildOverview(guildId)),
  getScan: (guildId: string) => delay(buildScan(guildId), LATENCY + 180),
  getEvents: (_guildId: string, limit = 10) => delay(clone(EVENTS).slice(0, limit)),
  getAntinuke: (guildId: string) => delay(clone(getConfig(guildId))),

  patchAntinuke: async (guildId: string, patch: Partial<AntinukeConfig>) => {
    // A reachable failure path, so the optimistic-rollback branch is testable.
    if (patch.alertChannelId === '__fail__') {
      throw new ApiError('The mock API was asked to fail.', 500, true);
    }
    const next = { ...getConfig(guildId), ...patch };
    store.configs.set(guildId, next);
    return delay(clone(next));
  },

  getWhitelist: (guildId: string) => delay(clone(getWhitelist(guildId))),

  addWhitelist: async (guildId: string, targetId: string, type: 'user' | 'role') => {
    const list = getWhitelist(guildId);
    const name =
      type === 'role'
        ? (ROLES.find((r) => r.id === targetId)?.name ?? 'Unknown role')
        : 'Unknown user';
    const entry: WhitelistEntry = {
      id: `wl_${Date.now()}`, guildId, targetId, type, name,
      addedById: USER.id, addedByName: USER.username,
      createdAt: new Date().toISOString(),
    };
    list.push(entry);
    return delay(clone(entry));
  },

  removeWhitelist: async (guildId: string, entryId: string) => {
    store.whitelist.set(guildId, getWhitelist(guildId).filter((e) => e.id !== entryId));
    return delay(undefined);
  },

  getWhitelistCandidates: (guildId: string) => {
    const taken = new Set(getWhitelist(guildId).map((e) => e.targetId));
    const candidates: WhitelistCandidate[] = ROLES
      .filter((r) => !taken.has(r.id))
      .map((r) => ({ id: r.id, name: r.name, type: 'role' as const }));
    return delay(candidates);
  },

  testAlert: () => delay(undefined, 500),
  getChannels: (_guildId: string) => delay(clone(CHANNELS)),
  getRoles: (_guildId: string) => delay(clone(ROLES)),

  getFeature: (guildId: string, feature: string): Promise<FeatureResponse> => {
    const schema = FEATURE_SCHEMAS[feature];
    if (!schema) throw new ApiError('Unknown feature', 404);
    const key = `${guildId}:${feature}`;
    if (!store.features.has(key)) store.features.set(key, defaultsFor(schema));
    return delay({ schema, config: clone(store.features.get(key)!) });
  },
  patchFeature: (guildId: string, feature: string, patch: FeatureConfig): Promise<FeatureResponse> => {
    const schema = FEATURE_SCHEMAS[feature];
    if (!schema) throw new ApiError('Unknown feature', 404);
    const key = `${guildId}:${feature}`;
    const next = { ...(store.features.get(key) ?? defaultsFor(schema)), ...patch };
    store.features.set(key, next);
    return delay({ schema, config: clone(next) });
  },
};

export type MockApi = typeof mockApi;
