import { useQuery } from '@tanstack/react-query';
import { api, qk } from '../api/client';

export const useMe = () => useQuery({ queryKey: qk.me, queryFn: api.getMe });
export const useGuilds = () => useQuery({ queryKey: qk.guilds, queryFn: api.getGuilds });

export const useOverview = (guildId: string) =>
  useQuery({ queryKey: qk.overview(guildId), queryFn: () => api.getOverview(guildId) });

export const useScan = (guildId: string) =>
  useQuery({ queryKey: qk.scan(guildId), queryFn: () => api.getScan(guildId) });

export const useEvents = (guildId: string) =>
  useQuery({ queryKey: qk.events(guildId), queryFn: () => api.getEvents(guildId, 10) });

export const useAntinuke = (guildId: string) =>
  useQuery({ queryKey: qk.antinuke(guildId), queryFn: () => api.getAntinuke(guildId) });

export const useWhitelist = (guildId: string) =>
  useQuery({ queryKey: qk.whitelist(guildId), queryFn: () => api.getWhitelist(guildId) });

export const useChannels = (guildId: string) =>
  useQuery({ queryKey: qk.channels(guildId), queryFn: () => api.getChannels(guildId) });

export const useRoles = (guildId: string) =>
  useQuery({ queryKey: qk.roles(guildId), queryFn: () => api.getRoles(guildId) });
