/**
 * API types.
 *
 * These mirror the bot's Prisma models (`AntinukeConfig`, `Whitelist`, `Guild`,
 * `Case`) rather than inventing a parallel shape. The dashboard is a view and
 * editor over the rows the bot owns — never a second source of truth.
 */

export type Punishment = 'ban' | 'kick' | 'strip' | 'quarantine' | 'removeperms';

/** Keys of the watched destructive actions, matching AntinukeConfig.thresholds. */
/** Exactly the keys in the bot's WATCHED_ACTIONS — the bot is the source of truth. */
export type ActionKey =
  | 'ban'
  | 'kick'
  | 'prune'
  | 'channelCreate'
  | 'channelDelete'
  | 'channelUpdate'
  | 'roleCreate'
  | 'roleDelete'
  | 'roleUpdateDangerous'
  | 'webhookCreate'
  | 'webhookDelete'
  | 'botAdd'
  | 'guildUpdate'
  | 'emojiDelete'
  | 'stickerDelete';

export interface Threshold {
  enabled: boolean;
  limit: number;
  windowSec: number;
}

export type ThresholdMap = Record<ActionKey, Threshold>;

/** Mirrors Prisma `AntinukeConfig`. */
export interface AntinukeConfig {
  guildId: string;
  enabled: boolean;
  punishment: Punishment;
  autoRevert: boolean;
  alertChannelId: string | null;
  quarantineRoleId: string | null;
  antiRaidEnabled: boolean;
  raidJoinCount: number;
  raidWindowSec: number;
  panicMode: boolean;
  autoLockOnTrigger: boolean;
  thresholds: ThresholdMap;
  whitelistLimitEnabled: boolean;
  whitelistLimits: Partial<Record<ActionKey, Threshold>>;
}

/** Mirrors Prisma `Whitelist`. */
export interface WhitelistEntry {
  id: string;
  guildId: string;
  targetId: string;
  type: 'user' | 'role';
  name: string;
  addedById: string;
  addedByName: string;
  createdAt: string;
}

export type Tier = 'PROTECTED' | 'GUARDED' | 'ELEVATED' | 'AT RISK';

export interface Metric {
  key: string;
  label: string;
  value: number | string;
  /** Change vs. 7 days ago; null when no history exists yet. */
  delta: number | null;
  /** Threat metrics render red when non-zero. */
  isThreat?: boolean;
}

export interface ProtectionState {
  key: 'antinuke' | 'antiraid' | 'automod' | 'autorevert' | 'panic' | 'modlog';
  label: string;
  enabled: boolean;
  /** Route to the control that governs this, for the click-through. */
  href: string;
  /** Panic mode reads as critical when on, not as success. */
  tone?: 'default' | 'critical';
}

/** A blocking problem that stops Anti-Nuke working at all. */
export interface BlockingIssue {
  code: 'no_audit_log' | 'missing_punish_perm' | 'role_too_low' | 'bot_absent';
  title: string;
  detail: string;
  fix: string;
}

export interface Readiness {
  botPresent: boolean;
  viewAuditLog: boolean;
  punishPermission: boolean;
  roleAboveMembers: boolean;
  highestRolePosition: number;
}

export interface Overview {
  guild: GuildSummary;
  integrityIndex: number;
  tier: Tier;
  verdict: string;
  metrics: Metric[];
  protection: ProtectionState[];
  readiness: Readiness;
  blocking: BlockingIssue | null;
  /** 7-day integrity history for the hero sparkline. */
  history: { date: string; value: number }[];
}

export type Severity = 'critical' | 'warning' | 'info';

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** Where the Fix button goes. A finding with no fix does not belong here. */
  fixAction: { label: string; href: string } | null;
}

export interface ScanResult {
  grade: string;
  scannedAt: string;
  findings: Finding[];
}

export interface SecurityEvent {
  id: string;
  executorId: string;
  executorName: string;
  action: string;
  target: string | null;
  outcome: string;
  outcomeTone: 'critical' | 'warning' | 'success' | 'muted';
  createdAt: string;
}

export interface GuildSummary {
  id: string;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  /** False when the user lacks Manage Server; the card renders locked. */
  canManage: boolean;
  botPresent: boolean;
  tier: Tier | null;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'category' | 'voice';
}

export interface Role {
  id: string;
  name: string;
  position: number;
  color: number;
}

export interface WhitelistCandidate {
  id: string;
  name: string;
  type: 'user' | 'role';
}

export class ApiError extends Error {
  // Written out rather than using parameter properties, which `erasableSyntaxOnly`
  // disallows (they emit runtime code that a type-strip cannot erase).
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status: number, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryable = retryable;
  }
}
