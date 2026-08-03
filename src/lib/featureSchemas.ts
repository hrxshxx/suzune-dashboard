/**
 * Feature schemas — for MOCK/demo mode only.
 *
 * In a real deployment the backend is the single source of the schema and sends
 * it with every feature response; the page renders whatever it receives. This
 * mirror exists so `VITE_USE_MOCKS=true` can show working feature pages with no
 * backend. Keep it structurally in step with src/webapi/featureSchemas.js.
 */
import type { FeatureField, FeatureSchema } from '../api/types';

const f = (
  key: string,
  type: FeatureField['type'],
  label: string,
  extra: Partial<FeatureField> = {},
): FeatureField => ({ key, type, label, ...extra });

export const FEATURE_SCHEMAS: Record<string, FeatureSchema> = {
  moderation: {
    feature: 'moderation', title: 'Moderation', icon: 'hammer',
    description: 'Defaults applied to every moderation command.',
    sections: [{
      title: 'Command defaults',
      fields: [
        f('modLogEnabled', 'toggle', 'Post moderation actions to the mod-log', { description: 'Every ban, kick, timeout and warn is logged as a case.' }),
        f('dmOnAction', 'toggle', 'DM the user when actioned', { description: 'Send a DM explaining what happened and why.' }),
        f('muteRoleId', 'role', 'Mute role', { description: 'Applied by /mute. Leave unset to use Discord timeouts.' }),
      ],
    }],
  },
  automod: {
    feature: 'automod', title: 'Automod', icon: 'wand',
    description: 'Real-time content filtering. Heat scoring plus native Discord rules.',
    sections: [
      {
        title: 'Heat scoring',
        description: 'Each violation adds heat; crossing the threshold triggers the action.',
        fields: [
          f('enabled', 'toggle', 'Enable heat-based automod'),
          f('heatThreshold', 'number', 'Heat threshold', { min: 10, max: 1000, step: 5, unit: 'heat' }),
          f('heatDecaySec', 'number', 'Heat cools every', { min: 5, max: 600, step: 5, unit: 'seconds' }),
          f('thresholdAction', 'select', 'Action at threshold', {
            options: ['warn', 'timeout', 'kick', 'ban', 'quarantine'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
          }),
        ],
      },
      {
        title: 'Exemptions',
        fields: [f('exemptRoles', 'roles', 'Exempt roles'), f('exemptChannels', 'channels', 'Exempt channels')],
      },
      {
        title: 'Native Discord AutoMod',
        description: 'Provisioned through Discord’s AutoModeration API.',
        fields: [
          f('nativeEnabled', 'toggle', 'Enable native rules'),
          f('nativeInvites', 'toggle', 'Block invite links'),
          f('nativeScamLinks', 'toggle', 'Block scam & phishing links'),
          f('nativeSpam', 'toggle', 'Block spam'),
          f('nativeMentions', 'toggle', 'Block mass mentions'),
          f('nativeAlert', 'toggle', 'Alert staff on a block'),
          f('nativeAlertChannelId', 'channel', 'Alert channel'),
          f('nativeTimeout', 'toggle', 'Time the user out on a block'),
          f('nativeTimeoutSeconds', 'number', 'Timeout duration', { min: 60, max: 2419200, step: 60, unit: 'seconds' }),
        ],
      },
    ],
  },
  logging: {
    feature: 'logging', title: 'Logging', icon: 'list',
    description: 'Pick a channel for each category; leave one unset to skip it.',
    sections: [{
      title: 'Event channels',
      fields: [
        f('memberJoinLeave', 'channel', 'Member joins & leaves'),
        f('messageEdit', 'channel', 'Message edits'),
        f('messageDelete', 'channel', 'Message deletes'),
        f('modActions', 'channel', 'Moderation actions'),
        f('roleChanges', 'channel', 'Role changes'),
        f('channelChanges', 'channel', 'Channel changes'),
        f('voice', 'channel', 'Voice activity'),
        f('serverChanges', 'channel', 'Server changes'),
      ],
    }],
  },
  tickets: {
    feature: 'tickets', title: 'Tickets', icon: 'ticket',
    description: 'The panel and categories are set up with /tickets in Discord.',
    sections: [{
      title: 'Behaviour',
      fields: [
        f('enabled', 'toggle', 'Enable tickets'),
        f('maxOpenPerUser', 'number', 'Max open tickets per user', { min: 1, max: 10, step: 1, unit: 'tickets' }),
        f('logChannelId', 'channel', 'Ticket log channel'),
        f('transcriptChannelId', 'channel', 'Transcript channel'),
        f('dmTranscript', 'toggle', 'DM the transcript to the opener on close'),
      ],
    }],
  },
  leveling: {
    feature: 'leveling', title: 'Leveling', icon: 'trending',
    description: 'Reward activity with XP. Role rewards are set with /levels.',
    sections: [
      {
        title: 'XP',
        fields: [
          f('enabled', 'toggle', 'Enable leveling'),
          f('xpMin', 'number', 'Minimum XP per message', { min: 1, max: 100, step: 1, unit: 'xp' }),
          f('xpMax', 'number', 'Maximum XP per message', { min: 1, max: 100, step: 1, unit: 'xp' }),
          f('cooldownSec', 'number', 'XP cooldown', { min: 0, max: 3600, step: 5, unit: 'seconds' }),
          f('announce', 'toggle', 'Announce level-ups'),
        ],
      },
      {
        title: 'Ignored',
        fields: [f('ignoredChannels', 'channels', 'Ignored channels'), f('ignoredRoles', 'roles', 'Ignored roles')],
      },
    ],
  },
  welcome: {
    feature: 'welcome', title: 'Welcome', icon: 'user-plus',
    description: 'Placeholders: {mention}, {user}, {server}, {memberCount}.',
    sections: [
      {
        title: 'Welcome',
        fields: [
          f('welcomeEnabled', 'toggle', 'Enable welcome messages'),
          f('welcomeChannelId', 'channel', 'Welcome channel'),
          f('welcomeMessage', 'textarea', 'Welcome message', { maxLength: 1500, default: 'Welcome {mention} to **{server}**! You are member #{memberCount}.' }),
        ],
      },
      {
        title: 'Goodbye',
        fields: [
          f('goodbyeEnabled', 'toggle', 'Enable goodbye messages'),
          f('goodbyeChannelId', 'channel', 'Goodbye channel'),
          f('goodbyeMessage', 'textarea', 'Goodbye message', { maxLength: 1500, default: '**{user}** has left the server.' }),
        ],
      },
    ],
  },
};

/** Which features have a functional config page. Others render as informational. */
export const FUNCTIONAL_FEATURES = Object.keys(FEATURE_SCHEMAS);

export function fieldDefault(field: FeatureField): unknown {
  switch (field.type) {
    case 'toggle': return false;
    case 'number': return field.min ?? 0;
    case 'text':
    case 'textarea': return field.default ?? '';
    case 'select': return field.options?.[0]?.value ?? '';
    case 'channels':
    case 'roles': return [];
    default: return null;
  }
}

export function defaultsFor(schema: FeatureSchema): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const section of schema.sections) {
    for (const field of section.fields) out[field.key] = fieldDefault(field);
  }
  return out;
}
