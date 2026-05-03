'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileSidebarContext } from './MobileSidebarContext';

import type { SidebarNavLink } from '@/lib/navigation/sidebar-nav';
import type { UserDto } from '@/types/api';

type AuthenticatedChromeProps = Readonly<{
  children: React.ReactNode;
  sidebarNav: readonly SidebarNavLink[];
  sidebarUser: UserDto;
}>;

export function AuthenticatedChrome({
  children,
  sidebarNav,
  sidebarUser,
}: AuthenticatedChromeProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider
      value={{
        open: () => setIsMobileSidebarOpen(true),
        close: () => setIsMobileSidebarOpen(false),
      }}
    >
      <div className="bg-light flex min-h-dvh min-h-screen">
        <Sidebar
          navLinks={sidebarNav}
          prefetchedUser={sidebarUser}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="bg-light flex min-w-0 flex-1 flex-col">
          <main className="bg-light text-dark flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-6">{children}</div>
          </main>
        </div>
      </div>
    </MobileSidebarContext.Provider>
  );
}
