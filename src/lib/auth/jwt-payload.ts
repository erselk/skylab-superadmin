import type { UserDto } from '@/types/api';

/**
 * JWT imzasını doğrulamaz; UI tarafında rol çıkarması için yüzey parse.
 */

function decodePayloadRecord(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf8');
    const obj = JSON.parse(json);
    return obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Bilinen claim ve nesne şekillerinden düz string listesi çıkarır */
function collectStringsFromClaim(value: unknown, depth = 0): string[] {
  if (depth > 8 || value === undefined || value === null) return [];
  if (typeof value === 'string') {
    const s = value.trim();
    if (s.startsWith('[') || s.startsWith('{')) {
      try {
        return collectStringsFromClaim(JSON.parse(s), depth + 1);
      } catch {
        /* düz metin olarak devam */
      }
    }
    return s
      .split(/[\s,|;]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) return value.flatMap((v) => collectStringsFromClaim(v, depth + 1));
  if (typeof value !== 'object' || value === null) return [];
  const o = value as Record<string, unknown>;
  const keys = [
    'authority',
    'Authority',
    'name',
    'role',
    'roleName',
    'authorityName',
    'roles',
  ] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return collectStringsFromClaim(v, depth + 1);
    if (v !== undefined && v !== null) {
      const nested = collectStringsFromClaim(v, depth + 1);
      if (nested.length > 0) return nested;
    }
  }
  /** realm_access vb. için: bilinmeyen obje ise değerlere recursive in */
  return Object.values(o).flatMap((v) => collectStringsFromClaim(v, depth + 1));
}

/**
 * Erişim tokenından rol benzeri iddiaları toplar (Spring, Keycloak, Azure AD varyasyonları).
 */
export function extractRolesFromJwtAccessToken(token: string | null | undefined): string[] {
  if (!token?.trim()) return [];
  const p = decodePayloadRecord(token.trim());
  if (!p) return [];

  const chunks: unknown[] = [
    p.roles,
    p.authorities,
    p.Authorities,
    p.permissions,
    p.scope,
    p['realm_access'],
    p['resource_access'],
  ];

  const realm = p['realm_access'] as Record<string, unknown> | undefined;
  if (realm?.['roles']) chunks.push(realm['roles']);

  if (typeof p['resource_access'] === 'object' && p['resource_access']) {
    for (const v of Object.values(p['resource_access'] as Record<string, unknown>)) {
      if (v && typeof v === 'object' && Array.isArray((v as { roles?: unknown }).roles)) {
        chunks.push((v as { roles: unknown }).roles);
      }
    }
  }

  const out: string[] = [];
  for (const c of chunks) {
    out.push(...collectStringsFromClaim(c));
  }
  return Array.from(new Set(out));
}

/**
 * /users/me body'sinde roller yoksa sık görülen senaryoda roller JWT'dendedir — birleştirir.
 */
export function enrichUserRolesFromAccessToken(user: UserDto, accessToken: string | null): UserDto {
  const fromJwt = extractRolesFromJwtAccessToken(accessToken);
  if (fromJwt.length === 0) return user;

  const r = user.roles as unknown;
  const baseArr: string[] = [];
  if (Array.isArray(r)) {
    for (const x of r) {
      if (typeof x === 'string') baseArr.push(x);
    }
  } else if (typeof r === 'string' && r.trim()) {
    baseArr.push(r);
  }

  const merged = Array.from(new Set([...baseArr, ...fromJwt]));
  return { ...user, roles: merged };
}
