import {
  SKYLAB_EVENT_TYPE_ROLE_GROUPS,
  SKYLAB_LEADER_ROLES,
  SKYLAB_PRIVILEGED_ROLES,
} from '@/config/skylab-opa-roles';

const ROLE_GROUP_VALUES = Object.values(SKYLAB_EVENT_TYPE_ROLE_GROUPS).flat() as readonly string[];
/** Lider kümesinde olup bir event grubunda tek başına yazılmamış roller (ör. SKYSEC_LEADER) */
const LEADER_EXTRA = SKYLAB_LEADER_ROLES.filter((r) => !ROLE_GROUP_VALUES.includes(r));

// Backend LDAP / gateway — OPA privileged + event_type_roles + fazladan leader roller
export const ALLOWED_ROLES = [
  ...SKYLAB_PRIVILEGED_ROLES,
  ...ROLE_GROUP_VALUES,
  ...LEADER_EXTRA,
  'USER',
] as const;

export type AllowedRole = (typeof ALLOWED_ROLES)[number];

// Hangi rolün hangi rolleri atayabileceği
export const ASSIGNABLE_ROLES_BY_ROLE: Record<AllowedRole, AllowedRole[]> = {
  ADMIN: [...ALLOWED_ROLES],
  YK: ['USER'],
  DK: ['USER'],
  GECEKODU: ['GECEKODU_LEADER', 'USER'],
  AGC: ['AGC_LEADER', 'USER'],
  BIZBIZE: ['BIZBIZE_LEADER', 'USER'],
  GECEKODU_LEADER: ['USER'],
  AGC_LEADER: ['USER'],
  BIZBIZE_LEADER: ['USER'],
  SKYSEC_LEADER: ['USER'],
  USER: [],
};

export function isRoleAllowed(role: string): role is AllowedRole {
  return (ALLOWED_ROLES as readonly string[]).includes(role);
}

export function canAssign(targetRole: AllowedRole, currentUserRoles: string[]): boolean {
  // ADMIN her şeyi atar
  if (currentUserRoles.includes('ADMIN')) return true;
  for (const role of currentUserRoles) {
    if ((ASSIGNABLE_ROLES_BY_ROLE as Record<string, AllowedRole[]>)[role]?.includes(targetRole)) {
      return true;
    }
  }
  return false;
}

// Backend (LDAP) için role parametre normalizasyonu
// Bazı gruplar LDAP'ta küçük harf ile tanımlı: admin, user, yk, dk
export function normalizeRoleForBackend(role: string): string {
  const lowerCaseRoles = new Set(['ADMIN', 'USER', 'YK', 'DK']);
  if (lowerCaseRoles.has(role.toUpperCase())) {
    return role.toLowerCase();
  }
  return role;
}
