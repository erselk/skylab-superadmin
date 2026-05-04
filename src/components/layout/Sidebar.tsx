'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isMobileOpen) setIsUserMenuOpen(false);
  }, [isMobileOpen]);

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
      <div
        className={`flex flex-col overflow-hidden ${isUserMenuOpen ? 'border-dark-700 rounded-lg border' : ''}`}
      >
        {isUserMenuOpen && (
          <button
            type="button"
            title="Çıkış Yap"
            onClick={handleLogout}
            className={`group border-dark-700 bg-dark-800 hover:bg-dark-700 flex w-full cursor-pointer items-center border-b px-4 py-3 text-sm font-medium transition-colors ${showDetails ? 'justify-start gap-3' : 'justify-center'}`}
          >
            <HiOutlineArrowRightOnRectangle
              className="text-danger group-hover:text-danger-300 h-5 w-5 shrink-0"
              aria-hidden
            />
            {showDetails ? (
              <span className="text-danger group-hover:text-danger-300">Çıkış Yap</span>
            ) : (
              <span className="sr-only">Çıkış Yap</span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          aria-expanded={isUserMenuOpen}
          className={`group hover:bg-dark-800 flex w-full cursor-pointer items-center gap-3 p-2 transition-colors ${
            isUserMenuOpen ? 'rounded-none' : 'rounded-lg'
          } ${showDetails ? '' : 'justify-center'}`}
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
          showLabels ? 'min-h-[3.75rem] justify-start py-3' : 'justify-center'
        }`}
      >
        {showLabels ? (
          <div className="flex h-14 w-full min-w-0 flex-1 items-center justify-start overflow-hidden pr-1">
            <img
              src="/logoyatay.png"
              alt="Skylab Admin"
              className="h-full max-h-14 w-full object-contain object-left"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden p-1">
            <img
              src="/logo.png"
              alt="Skylab Admin"
              className="h-full w-full object-contain object-center"
            />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-2">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));

            const linkClasses = [
              'flex cursor-pointer items-center rounded-lg text-sm font-medium transition-colors',
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

      <div className="border-dark-700 border-t px-3 pt-4 pb-3">{renderUserSection(showLabels)}</div>
    </div>
  );

  return (
    <>
      <aside
        className={`bg-dark text-light hidden h-screen shrink-0 flex-col transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:flex ${
          isDesktopExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsDesktopExpanded(true)}
        onMouseLeave={() => {
          setIsDesktopExpanded(false);
          setIsUserMenuOpen(false);
        }}
      >
        {renderMenu(isDesktopExpanded)}
      </aside>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className="bg-dark/60 absolute inset-0 cursor-pointer"
          onClick={onMobileClose}
          role="presentation"
        />
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
