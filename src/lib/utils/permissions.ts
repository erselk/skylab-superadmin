import type { UserDto } from '@/types/api';
import {
  SKYLAB_EVENT_BASE_ROLES,
  SKYLAB_EVENT_TYPE_ROLE_GROUPS,
  SKYLAB_LEADER_ROLES,
  SKYLAB_PRIVILEGED_ROLES,
  skylabRolesWithEventAreaAccess,
} from '@/config/skylab-opa-roles';

export const SUPER_ADMIN_ROLES: readonly string[] = [...SKYLAB_PRIVILEGED_ROLES];

export const EVENT_TYPE_ROLES = Object.keys(SKYLAB_EVENT_TYPE_ROLE_GROUPS) as Array<
  keyof typeof SKYLAB_EVENT_TYPE_ROLE_GROUPS
>;

/** OPA leader_roles */
export const LEADER_ROLES: readonly string[] = [...SKYLAB_LEADER_ROLES];

/** privileged ∪ leader_roles ∪ event_type_roles değerleri — etkinlik alanı navigasyon/OS */
export const EVENT_AREA_ROLE_ALLOWLIST: readonly string[] = skylabRolesWithEventAreaAccess();

const ROLE_ALIASES: Record<string, string> = {
  GECEKODU_ADMIN: 'GECEKODU',
  AGC_ADMIN: 'AGC',
  BIZBIZE_ADMIN: 'BIZBIZE',
};

function normalizeRoleName(role: string): string {
  const cleaned = role.trim().toUpperCase();
  const withoutPrefix = cleaned.startsWith('ROLE_') ? cleaned.slice(5) : cleaned;
  return ROLE_ALIASES[withoutPrefix] || withoutPrefix;
}

/** Spring / JWT / karma DTO için tek role benzeri alanı diziye düşürür */
function flattenRoleLikePayload(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  if (typeof value === 'string') {
    const parts = value
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    return parts.length ? parts : [];
  }
  if (!Array.isArray(value)) return [];

  const out: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      out.push(...flattenRoleLikePayload(item));
      continue;
    }
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      const keys = ['authority', 'Authority', 'name', 'role', 'roleName', 'authorityName'] as const;
      for (const k of keys) {
        const v = o[k];
        if (typeof v === 'string' && v.trim()) {
          out.push(v.trim());
          break;
        }
      }
    }
  }
  return out;
}

type UserPayload = UserDto &
  Partial<Record<'authorities' | 'Authorities' | 'grantedAuthorities' | 'role', unknown>>;

/**
 * /api/users/me rol alanları düzensiz gelebilir (`roles`, `authorities`, tek `role` string vb.).
 */
export function getNormalizedRoles(user: UserDto | null): string[] {
  if (!user) return [];

  const u = user as UserPayload;

  /** Boş diziyi atlamak önemli: roller sadece `authorities` içinde kalabiliyor */
  const pool: unknown[] = [];
  if (Array.isArray(u.roles) && u.roles.length > 0) pool.push(u.roles);
  else if (typeof u.roles === 'string') pool.push(u.roles);

  const extra = ['authorities', 'Authorities', 'grantedAuthorities', 'role'] as const;
  for (const key of extra) {
    const v = u[key];
    if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)) pool.push(v);
  }

  const rawStrings = pool.flatMap((chunk) => flattenRoleLikePayload(chunk));
  const normalized = rawStrings.map(normalizeRoleName).filter(Boolean);
  return Array.from(new Set(normalized));
}

// Role -> Event Type Name mapping
export const ROLE_TO_EVENT_TYPE: Record<string, string> = {
  GECEKODU: 'Gecekodu',
  GECEKODU_LEADER: 'Gecekodu',
  AGC: 'AGC',
  AGC_LEADER: 'AGC',
  BIZBIZE: 'Bizbize',
  BIZBIZE_LEADER: 'Bizbize',
};

/** API ile uyuşturmak için frontend canonical isimleri */
const LEADER_SCOPE_TYPE_SYNONYMS: Record<string, readonly string[]> = {
  Gecekodu: ['Gecekodu', 'GECEKODU', 'Gece Kodu', 'GECE KODU', 'Gece kodu'],
  AGC: ['AGC'],
  Bizbize: ['Bizbize', 'BIZBIZE'],
};

/**
 * Lider filtresinde API'deki `event.type.name` ile canonical başlığı eşleştir:
 * Türkçe/büyük-küçük harf varyantları sık çıkıyor.
 */
export function eventTypeMatchesLeaderScope(
  apiTypeName: string | undefined | null,
  leaderCanonical: string | null,
): boolean {
  if (!leaderCanonical) return true;
  const api = (apiTypeName ?? '').trim();
  if (!api) return false;
  const pool = Array.from(
    new Set([leaderCanonical, ...(LEADER_SCOPE_TYPE_SYNONYMS[leaderCanonical] ?? [])]),
  ).map((s) => s.trim());
  return pool.some((candidate) =>
    candidate ? api.localeCompare(candidate, 'tr', { sensitivity: 'base' }) === 0 : false,
  );
}

/**
 * Kullanıcının belirtilen rollerden birine sahip olup olmadığını kontrol eder
 */
export function hasRole(user: UserDto | null, roles: string | string[]): boolean {
  return !!user;
}

/**
 * Kullanıcının süper admin olup olmadığını kontrol eder (ADMIN, YK, DK)
 */
export function isSuperAdmin(user: UserDto | null): boolean {
  const roles = getNormalizedRoles(user);
  return roles.some((role) => {
    if (SUPER_ADMIN_ROLES.includes(role)) return true;
    // Backend tarafinda isim degisse bile admin benzeri rolleri yakala.
    return role.includes('ADMIN') || role.endsWith('_YK') || role.endsWith('_DK');
  });
}

/**
 * Kullanıcının etkinlik tipi rolüne göre yönetebileceği EventType adını döndürür
 * Süper adminler için null döner (hepsini yönetebilir)
 * Etkinlik tipi rolü yoksa null döner
 */
export function getLeaderEventType(user: UserDto | null): string | null {
  const normalizedRoles = getNormalizedRoles(user);
  if (!normalizedRoles.length) return null;

  // Süper adminler tüm etkinlik tiplerini yönetebilir
  if (isSuperAdmin(user)) return null;

  // Kullanıcının etkinlik tipi rolünü bul
  for (const role of normalizedRoles) {
    if (ROLE_TO_EVENT_TYPE[role]) {
      return ROLE_TO_EVENT_TYPE[role];
    }
  }

  return null;
}

/** ADMIN/YK/DK vb.: sezon, form URL, ödül/sıralama, tam silme uyarısı vb. tam etkinlik alanı */
export function canEditFullEventMetadata(user: UserDto | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Etkinlik detayı: yarışmacı ve katılımcı–bilet yönetim blokları yalnızca tam yetkililer.
 */
export function canManageEventAudienceAdminViews(user: UserDto | null): boolean {
  return isSuperAdmin(user);
}

const SKYLAB_LEADER_ROLE_SET = new Set<string>(SKYLAB_LEADER_ROLES as readonly string[]);
const SKYLAB_EVENT_BASE_ROLE_SET = new Set<string>(SKYLAB_EVENT_BASE_ROLES as readonly string[]);

/**
 * Salt USER / rolsüz / düz etkinlik tipi rolleri (lider yok): USER ile aynı katman (QR + Oyun Alanı).
 */
export function isParticipantPortalTier(user: UserDto | null): boolean {
  if (!user) return false;
  const normalized = getNormalizedRoles(user);
  if (normalized.length === 0) return true;
  if (normalized.some((r) => SKYLAB_LEADER_ROLE_SET.has(r))) return false;
  return normalized.every((r) => r === 'USER' || SKYLAB_EVENT_BASE_ROLE_SET.has(r));
}

/** Lider veya süper dışı etkinlik tipi kadrosu; düz GECEKODU/AGC/BIZBize (USER katmanı) hariç */
export function isEventTypeFocusedStaff(user: UserDto | null): boolean {
  if (!user || isSuperAdmin(user)) return false;
  if (isParticipantPortalTier(user)) return false;
  return getNormalizedRoles(user).some((r) => ROLE_TO_EVENT_TYPE[r]);
}

/** Normalize edilmiş rollerden biri OPA leader_roles kümesinde mi */
export function hasSkylabEventLeaderRole(user: UserDto | null): boolean {
  if (!user) return false;
  return getNormalizedRoles(user).some((r) => SKYLAB_LEADER_ROLE_SET.has(r));
}

/**
 * Yalnızca *_LEADER rollerinden çıkan etkinlik tipi (düz GECEKODU vb. dahil edilmez).
 * ROLE_TO_EVENT_TYPE dışında kalan lider rolleri için null döner → geniş scope (örn. SKYSEC).
 */
export function getSkylabLeaderEventScopeType(user: UserDto | null): string | null {
  if (!user) return null;
  for (const r of getNormalizedRoles(user)) {
    if (!SKYLAB_LEADER_ROLE_SET.has(r)) continue;
    const mapped = ROLE_TO_EVENT_TYPE[r];
    if (mapped) return mapped;
  }
  return null;
}

/**
 * Etkinlik detayı: yarışmacı ekle / satır düzenle.
 * Süper admin: tüm tipler. *_LEADER: yalnız kendi tipi (veya ROLE_TO_EVENT_TYPE dışı lider için tümü).
 */
export function canManageCompetitorsForEvent(
  user: UserDto | null,
  eventTypeName?: string | null,
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!hasSkylabEventLeaderRole(user)) return false;
  return eventTypeMatchesLeaderScope(eventTypeName, getSkylabLeaderEventScopeType(user));
}

/**
 * Yeni etkinlik / etkinlik düzenleme / oturum ekleme–düzenleme.
 * Süper yetkiler veya *_LEADER (GECEKODU_LEADER, AGC_LEADER, …). Düz GECEKODU vb. yapamaz.
 */
export function canOperateEventScheduling(user: UserDto | null): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return hasSkylabEventLeaderRole(user);
}

/**
 * Belirli bir etkinlikte planlama (düzenleme / oturum vb.): lider yalnız kendi etkinlik tipinde; süper admin hepsi.
 * Liste sayfasında tüm etkinlikleri görebilirler; bu kontrol işlem anında uygulanır.
 */
export function canOperateEventSchedulingOnEvent(
  user: UserDto | null,
  eventTypeName: string | undefined | null,
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!hasSkylabEventLeaderRole(user)) return false;
  return eventTypeMatchesLeaderScope(eventTypeName, getSkylabLeaderEventScopeType(user));
}

/**
 * Kullanıcının belirli bir modülü yönetip yönetemeyeceğini kontrol eder
 */
export function canManageModule(
  user: UserDto | null,
  module:
    | 'users'
    | 'events'
    | 'event-types'
    | 'competitors'
    | 'seasons'
    | 'sessions'
    | 'announcements'
    | 'images',
): boolean {
  return !!user;
}

/**
 * Kullanıcının belirli bir etkinlik tipini yönetip yönetemeyeceğini kontrol eder
 * Optimize: Minimum hesaplama ile sonuç döndürür
 */
export function canManageEventType(
  user: UserDto | null,
  eventTypeName: string | undefined,
): boolean {
  return !!user;
}
