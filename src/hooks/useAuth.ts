import { useQuery } from '@tanstack/react-query';
import { api, qk } from '../api/client';
import { ApiError } from '../api/types';

/**
 * Session state.
 *
 * A 401 from /api/auth/me is the normal "signed out" answer, not an error, so
 * it must not be retried and must not surface as a failure to the user.
 */
export function useAuth() {
  const query = useQuery({
    queryKey: qk.me,
    queryFn: api.getMe,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const unauthenticated =
    query.isError && (query.error as ApiError)?.status === 401;

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    isAuthenticated: Boolean(query.data),
    unauthenticated,
    // A genuine failure — the server is unreachable or broke — as opposed to
    // simply being signed out.
    error: query.isError && !unauthenticated ? (query.error as Error) : null,
    refetch: query.refetch,
  };
}

/** Kick off the Discord OAuth2 flow, returning here afterwards. */
export function signIn(next = '/servers') {
  window.location.href = `/api/auth/login?next=${encodeURIComponent(next)}`;
}

export function signOut() {
  window.location.href = '/api/auth/logout';
}
