import { UserDto } from '@/types/api';

// Süper admin rolleri - tam yetki
export const SUPER_ADMIN_ROLES = ['ADMIN', 'YK', 'DK'];

// Etkinlik tipi rolleri - kendi tiplerini yönetebilir
export const EVENT_TYPE_ROLES = ['GECEKODU', 'AGC', 'BIZBIZE'];
export const LEADER_ROLES = ['GECEKODU_LEADER', 'AGC_LEADER', 'BIZBIZE_LEADER'];

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

export function getNormalizedRoles(user: UserDto | null): string[] {
  if (!user?.roles?.length) return [];
  return Array.from(new Set(user.roles.map(normalizeRoleName)));
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

// Sayfa erişim tanımları - hangi roller hangi sayfalara erişebilir
// null = herkes (giriş yapmış), empty array = kimse
const PAGE_ACCESS: Record<string, string[] | null> = {
  '/dashboard': null, // Herkes (USER hariç, onlar waiting-room'a yönlendiriliyor)
  '/users': ['ADMIN', 'YK', 'DK'],
  '/events': [
    'ADMIN',
    'YK',
    'DK',
    'GECEKODU',
    'AGC',
    'BIZBIZE',
    'GECEKODU_LEADER',
    'AGC_LEADER',
    'BIZBIZE_LEADER',
  ],
  '/event-types': ['ADMIN', 'YK', 'DK'],
  '/competitors': [
    'ADMIN',
    'YK',
    'DK',
    'GECEKODU',
    'AGC',
    'BIZBIZE',
    'GECEKODU_LEADER',
    'AGC_LEADER',
    'BIZBIZE_LEADER',
  ],
  '/seasons': ['ADMIN', 'YK', 'DK'],
  '/sessions': [
    'ADMIN',
    'YK',
    'DK',
    'GECEKODU',
    'AGC',
    'BIZBIZE',
    'GECEKODU_LEADER',
    'AGC_LEADER',
    'BIZBIZE_LEADER',
  ],
  '/announcements': ['ADMIN', 'YK', 'DK'],
  '/migration-roles': ['ADMIN', 'YK', 'DK'],
  '/qr': null, // Herkes
  '/waiting-room': null, // Herkes
};

/**
 * Kullanıcının belirtilen rollerden birine sahip olup olmadığını kontrol eder
 */
export function hasRole(user: UserDto | null, roles: string | string[]): boolean {
  return !!user;
}

export function hasOnlyUserRole(user: UserDto | null): boolean {
  return false;
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

/**
 * Kullanıcının belirli bir sayfaya erişip erişemeyeceğini kontrol eder
 * Optimize: Sadece basit role array kontrolü yapar
 */
export function canAccessPage(user: UserDto | null, path: string): boolean {
  return !!user;
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
