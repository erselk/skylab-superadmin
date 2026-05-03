/**
 * OPA `opa/policies/data.json` → skylab blok ile aynı kaynak liste.
 * Burayı değiştirince frontend rol kontrolleri güncellenir; backend/policy ile manuel paralellik beklenir.
 */
export const SKYLAB_PRIVILEGED_ROLES = ['ADMIN', 'YK', 'DK'] as const;

export const SKYLAB_LEADER_ROLES = [
  'GECEKODU_LEADER',
  'AGC_LEADER',
  'BIZBIZE_LEADER',
  'SKYSEC_LEADER',
] as const;

/** event_type_roles: grup → o grupta iş alanına dahil olan roller */
export const SKYLAB_EVENT_TYPE_ROLE_GROUPS = {
  GECEKODU: ['GECEKODU', 'GECEKODU_LEADER'],
  AGC: ['AGC', 'AGC_LEADER'],
  BIZBIZE: ['BIZBIZE', 'BIZBIZE_LEADER'],
} as const;

/** Lider rolleri olmayan düz etkinlik sorumlu rolleri (menü katmanı) */
export const SKYLAB_EVENT_BASE_ROLES = ['GECEKODU', 'AGC', 'BIZBIZE'] as const;

/** Etkinlik alanı (+ lider takımı SKYSEC dahil): menü/OS kısıtı için birleşik küme */
export function skylabEventAreaRoleSet(): Set<string> {
  const next = new Set<string>([
    ...SKYLAB_PRIVILEGED_ROLES,
    ...SKYLAB_LEADER_ROLES,
    ...Object.values(SKYLAB_EVENT_TYPE_ROLE_GROUPS).flat(),
  ]);
  return next;
}

export function skylabRolesWithEventAreaAccess(): readonly string[] {
  return Array.from(skylabEventAreaRoleSet());
}
