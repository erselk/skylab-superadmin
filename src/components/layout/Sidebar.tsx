'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/users', label: 'Kullanıcılar', icon: '👥' },
  { href: '/competitions', label: 'Yarışmalar', icon: '🏆' },
  { href: '/events', label: 'Etkinlikler', icon: '📅' },
  { href: '/event-types', label: 'Etkinlik Tipleri', icon: '🏷️' },
  { href: '/competitors', label: 'Yarışmacılar', icon: '👤' },
  { href: '/seasons', label: 'Sezonlar', icon: '📆' },
  { href: '/sessions', label: 'Oturumlar', icon: '🎤' },
  { href: '/announcements', label: 'Duyurular', icon: '📢' },
  { href: '/images', label: 'Resimler', icon: '🖼️' },
  { href: '/qr', label: 'QR Kodlar', icon: '🔲' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Skylab Admin</h1>
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
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

