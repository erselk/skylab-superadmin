import type { UserDto } from '@/types/api';

import { SKYLAB_EVENT_BASE_ROLES, SKYLAB_LEADER_ROLES } from '@/config/skylab-opa-roles';
import { ADMIN_SIDEBAR_LINKS } from '@/lib/navigation/sidebar-registry';
import type { SidebarNavLink } from '@/lib/navigation/sidebar-types';
import { getNormalizedRoles, isParticipantPortalTier, isSuperAdmin } from '@/lib/utils/permissions';

export type { SidebarNavLink } from '@/lib/navigation/sidebar-types';

const QR_WAITING: readonly SidebarNavLink[] = [
  { href: '/qr', label: 'QR Kodlar' },
  { href: '/waiting-room', label: 'Oyun Alanı' },
] as const;

/** Tanınmayan ama yükseltilmiş bir rol (USER değil) — yan menüyü tamamen kesmeyelim */
const FALLBACK_AUTH_LINKS: readonly SidebarNavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/events', label: 'Etkinlikler' },
  ...QR_WAITING,
];

function hasLeaderRole(normalized: readonly string[]): boolean {
  const set = new Set<string>(SKYLAB_LEADER_ROLES);
  return normalized.some((r) => set.has(r));
}

function hasEventBaseRole(normalized: readonly string[]): boolean {
  const set = new Set<string>(SKYLAB_EVENT_BASE_ROLES);
  return normalized.some((r) => set.has(r));
}

export function filterSidebarNavForUser(user: UserDto): SidebarNavLink[] {
  const normalizedRoles = getNormalizedRoles(user);

  if (isParticipantPortalTier(user)) {
    return [...QR_WAITING];
  }

  if (isSuperAdmin(user)) {
    return [...ADMIN_SIDEBAR_LINKS];
  }

  const eb = hasEventBaseRole(normalizedRoles);
  const lr = hasLeaderRole(normalizedRoles);

  const out: SidebarNavLink[] = [];

  if (eb || lr) {
    out.push({ href: '/dashboard', label: 'Dashboard' }, { href: '/events', label: 'Etkinlikler' });
  }

  if (lr) {
    out.push(
      { href: '/announcements', label: 'Duyurular' },
      { href: '/users', label: 'Kullanıcılar' },
    );
  }

  for (const x of QR_WAITING) {
    if (!out.some((o) => o.href === x.href)) out.push(x);
  }

  /** Tanınmayan tek roller: çıplak bırakma — ama süper listesini de zorlamayız */
  if (out.length <= QR_WAITING.length && !lr && !eb) {
    return [...FALLBACK_AUTH_LINKS];
  }

  return out;
}
