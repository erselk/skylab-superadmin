import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const TOKEN_COOKIE_KEYS = ['auth_token', 'access_token', 'token'] as const;

export function getTokenFromCookies(cookieStore: ReadonlyRequestCookies): string | null {
  for (const key of TOKEN_COOKIE_KEYS) {
    const value = cookieStore.get(key)?.value;
    if (value) return value;
  }
  return null;
}
