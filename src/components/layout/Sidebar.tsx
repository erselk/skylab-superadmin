'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineTrophy,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineCalendarDays,
  HiOutlineMicrophone,
  HiOutlineMegaphone,
  HiOutlinePhoto,
  HiOutlineQrCode
} from 'react-icons/hi2';
import type { UserDto } from '@/types/api';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBar },
  { href: '/users', label: 'Kullanıcılar', icon: HiOutlineUsers },
  { href: '/competitions', label: 'Yarışmalar', icon: HiOutlineTrophy },
  { href: '/events', label: 'Etkinlikler', icon: HiOutlineCalendar },
  { href: '/event-types', label: 'Etkinlik Tipleri', icon: HiOutlineTag },
  { href: '/competitors', label: 'Yarışmacılar', icon: HiOutlineUser },
  { href: '/seasons', label: 'Sezonlar', icon: HiOutlineCalendarDays },
  { href: '/sessions', label: 'Oturumlar', icon: HiOutlineMicrophone },
  { href: '/announcements', label: 'Duyurular', icon: HiOutlineMegaphone },
  { href: '/images', label: 'Resimler', icon: HiOutlinePhoto },
  { href: '/qr', label: 'QR Kodlar', icon: HiOutlineQrCode },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="h-screen w-64 bg-dark text-light flex flex-col">
      <div className="p-4 border-b border-dark-700 flex items-center justify-center">
        <img 
          src="/logo.png" 
          alt="Skylab Admin" 
          className="w-full h-auto max-h-16 object-contain"
        />
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand text-light font-medium'
                      : 'text-light hover:bg-dark-800 hover:text-brand'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-dark-700">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-dark-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-dark-700 rounded animate-pulse mb-1.5" />
              <div className="h-3 bg-dark-700 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-dark font-semibold flex-shrink-0">
                {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-light font-medium text-sm truncate">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.username}
              </p>
              <p className="text-light/60 text-xs truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-dark-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-light/60 text-xs truncate">Kullanıcı bilgisi yüklenemedi</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

