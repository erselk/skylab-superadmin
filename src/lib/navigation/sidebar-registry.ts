import type { SidebarNavLink } from '@/lib/navigation/sidebar-types';

/**
 * Sidebar — süper roller (ADMIN / YK / DK): sadece buradakiler görünür.
 */
export const ADMIN_SIDEBAR_LINKS: readonly SidebarNavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/events', label: 'Etkinlikler' },
  { href: '/announcements', label: 'Duyurular' },
  { href: '/users', label: 'Kullanıcılar' },
  { href: '/event-types', label: 'Etkinlik Tipleri' },
  { href: '/seasons', label: 'Sezonlar' },
  { href: '/qr', label: 'QR Kodlar' },
  { href: '/waiting-room', label: 'Oyun Alanı' },
];
