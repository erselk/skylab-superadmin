'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HiOutlineCalendar,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineMegaphone,
  HiOutlineQrCode,
  HiOutlineSquares2X2,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlinePuzzlePiece,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';

import type { SidebarNavLink } from '@/lib/navigation/sidebar-nav';
import type { UserDto } from '@/types/api';
import type { IconType } from 'react-icons';

const NAV_ICON_BY_HREF: Record<string, IconType> = {
  '/dashboard': HiOutlineChartBar,
  '/events': HiOutlineCalendar,
  '/announcements': HiOutlineMegaphone,
  '/seasons': HiOutlineCalendarDays,
  '/event-types': HiOutlineTag,
  '/users': HiOutlineUsers,
  '/qr': HiOutlineQrCode,
  '/waiting-room': HiOutlinePuzzlePiece,
};

type SidebarProps = Readonly<{
  navLinks: readonly SidebarNavLink[];
  prefetchedUser: UserDto;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}>;

export function Sidebar({
  navLinks,
  prefetchedUser,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const effectiveUser = user ?? prefetchedUser;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const handleNavigate = () => {
    onMobileClose?.();
  };

  const renderUserSection = (showDetails: boolean) => {
    const initials =
      effectiveUser.firstName?.[0]?.toUpperCase() ||
      effectiveUser.username?.[0]?.toUpperCase() ||
      'U';

    return (
      <div className="relative">
        {isUserMenuOpen && (
          <div
            className={`border-dark-600 bg-dark-800 absolute bottom-full z-50 mb-2 overflow-hidden rounded-lg border shadow-xl ${showDetails ? 'right-0 left-0' : 'left-0 w-48'}`}
          >
            <button
              type="button"
              onClick={handleLogout}
              className="hover:bg-dark-700 flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 transition-colors hover:text-red-300"
            >
              <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`group hover:bg-dark-800 flex w-full items-center gap-3 rounded-lg p-2 transition-colors ${
            showDetails ? '' : 'justify-center'
          }`}
        >
          {effectiveUser.profilePictureUrl ? (
            <img
              src={effectiveUser.profilePictureUrl}
              alt={`${effectiveUser.firstName} ${effectiveUser.lastName}`}
              className="group-hover:ring-dark-600 h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-transparent transition-all"
            />
          ) : (
            <div className="bg-brand text-dark group-hover:ring-dark-600 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-transparent transition-all">
              {initials}
            </div>
          )}
          {showDetails && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-light truncate text-sm font-medium">
                {effectiveUser.firstName && effectiveUser.lastName
                  ? `${effectiveUser.firstName} ${effectiveUser.lastName}`
                  : effectiveUser.username}
              </p>
              <p className="text-light/60 truncate text-xs">{effectiveUser.email}</p>
            </div>
          )}
        </button>
      </div>
    );
  };

  const renderMenu = (showLabels: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={`border-dark-700 flex items-center border-b p-4 ${
          showLabels ? 'justify-start' : 'justify-center'
        }`}
      >
        {showLabels ? (
          <img
            src="/logoyatay.png"
            alt="Skylab Admin"
            className="h-12 w-auto origin-left transition-all"
          />
        ) : (
          <img src="/logo.png" alt="Skylab Admin" className="h-12 w-12 object-contain" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-2">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));

            const linkClasses = [
              'flex items-center rounded-lg text-sm font-medium transition-colors',
              showLabels ? 'gap-3 px-4 py-2 justify-start' : 'justify-center py-2',
              isActive ? 'bg-brand text-light' : 'text-light hover:bg-dark-800 hover:text-brand',
            ].join(' ');

            const Icon = NAV_ICON_BY_HREF[item.href] ?? HiOutlineSquares2X2;

            return (
              <li key={item.href}>
                <Link href={item.href} className={linkClasses} onClick={handleNavigate}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {showLabels && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-dark-700 border-t p-3">{renderUserSection(showLabels)}</div>
    </div>
  );

  return (
    <>
      <aside
        className={`bg-dark text-light hidden h-screen shrink-0 flex-col transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:flex ${
          isDesktopExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsDesktopExpanded(true)}
        onMouseLeave={() => setIsDesktopExpanded(false)}
      >
        {renderMenu(isDesktopExpanded)}
      </aside>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="bg-dark/60 absolute inset-0" onClick={onMobileClose} role="presentation" />
      </div>

      <aside
        className={`bg-dark text-light fixed inset-y-0 left-0 z-50 flex h-full w-64 transform flex-col shadow-lg transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderMenu(true)}
      </aside>
    </>
  );
}
