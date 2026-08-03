/**
 * Typed API client — one function per endpoint.
 *
 * Set `VITE_USE_MOCKS=true` to swap in the in-memory adapter, so the app is
 * demonstrable with no backend. Everything else in the app talks to this module
 * and never to `fetch` directly.
 *
 * The REST contract implemented here:
 *   GET    /api/auth/me
 *   GET    /api/guilds
 *   GET    /api/guilds/:id/overview
 *   GET    /api/guilds/:id/scan
 *   GET    /api/guilds/:id/events?limit=
 *   GET    /api/guilds/:id/antinuke
 *   PATCH  /api/guilds/:id/antinuke
 *   GET    /api/guilds/:id/antinuke/whitelist
 *   POST   /api/guilds/:id/antinuke/whitelist
 *   DELETE /api/guilds/:id/antinuke/whitelist/:entryId
 *   POST   /api/guilds/:id/antinuke/test-alert
 *   GET    /api/guilds/:id/channels
 *   GET    /api/guilds/:id/roles
 */
import { mockApi } from './mock';
import { ApiError } from './types';
import type {
  AntinukeConfig, Channel, DiscordUser, GuildSummary, Overview,
  Role, ScanResult, SecurityEvent, WhitelistCandidate, WhitelistEntry,
  FeatureResponse, FeatureConfig,
} from './types';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // Network-level failure: worth retrying, unlike a 4xx.
    throw new ApiError('Could not reach the server. Check your connection.', 0, true);
  }

  if (res.status === 401) {
    throw new ApiError('Your session expired. Sign in again.', 401);
  }
  if (res.status === 403) {
    throw new ApiError('You need Manage Server in this server to change its settings.', 403);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status, res.status >= 500);
  }

  if (res.status === 204) return undefined as T;

  // A proxy or misconfigured host can answer 200 with an HTML error page.
  // Parsing that raises "Unexpected token '<'", which tells the user nothing.
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(
      'The server returned an unexpected response. Check that the API is reachable at this address.',
      res.status,
      true,
    );
  }
  return (await res.json()) as T;
}

const real = {
  getMe: () => request<DiscordUser>('/api/auth/me'),
  getGuilds: () => request<GuildSummary[]>('/api/guilds'),
  getOverview: (guildId: string) => request<Overview>(`/api/guilds/${guildId}/overview`),
  getScan: (guildId: string) => request<ScanResult>(`/api/guilds/${guildId}/scan`),
  getEvents: (guildId: string, limit = 10) =>
    request<SecurityEvent[]>(`/api/guilds/${guildId}/events?limit=${limit}`),

  getAntinuke: (guildId: string) => request<AntinukeConfig>(`/api/guilds/${guildId}/antinuke`),
  patchAntinuke: (guildId: string, patch: Partial<AntinukeConfig>) =>
    request<AntinukeConfig>(`/api/guilds/${guildId}/antinuke`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  getWhitelist: (guildId: string) =>
    request<WhitelistEntry[]>(`/api/guilds/${guildId}/antinuke/whitelist`),
  addWhitelist: (guildId: string, targetId: string, type: 'user' | 'role') =>
    request<WhitelistEntry>(`/api/guilds/${guildId}/antinuke/whitelist`, {
      method: 'POST',
      body: JSON.stringify({ targetId, type }),
    }),
  removeWhitelist: (guildId: string, entryId: string) =>
    request<void>(`/api/guilds/${guildId}/antinuke/whitelist/${entryId}`, { method: 'DELETE' }),
  getWhitelistCandidates: (guildId: string) =>
    request<WhitelistCandidate[]>(`/api/guilds/${guildId}/antinuke/whitelist/candidates`),

  testAlert: (guildId: string) =>
    request<void>(`/api/guilds/${guildId}/antinuke/test-alert`, { method: 'POST' }),

  getChannels: (guildId: string) => request<Channel[]>(`/api/guilds/${guildId}/channels`),
  getRoles: (guildId: string) => request<Role[]>(`/api/guilds/${guildId}/roles`),

  getFeature: (guildId: string, feature: string) =>
    request<FeatureResponse>(`/api/guilds/${guildId}/features/${feature}`),
  patchFeature: (guildId: string, feature: string, patch: FeatureConfig) =>
    request<FeatureResponse>(`/api/guilds/${guildId}/features/${feature}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
};

export const api = USE_MOCKS ? mockApi : real;

/** Query keys, centralised so invalidation can never typo a key. */
export const qk = {
  me: ['me'] as const,
  guilds: ['guilds'] as const,
  overview: (id: string) => ['overview', id] as const,
  scan: (id: string) => ['scan', id] as const,
  events: (id: string) => ['events', id] as const,
  antinuke: (id: string) => ['antinuke', id] as const,
  whitelist: (id: string) => ['whitelist', id] as const,
  candidates: (id: string) => ['candidates', id] as const,
  channels: (id: string) => ['channels', id] as const,
  roles: (id: string) => ['roles', id] as const,
  feature: (id: string, feature: string) => ['feature', id, feature] as const,
};
