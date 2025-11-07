'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { GlobalErrorMessenger } from '@/components/common/GlobalErrorMessenger';
import { MobileSidebarContext } from './MobileSidebarContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider
      value={{
        open: () => setIsMobileSidebarOpen(true),
        close: () => setIsMobileSidebarOpen(false),
      }}
    >
      <div className="flex h-screen bg-light">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden bg-light">
          <main className="flex-1 overflow-y-auto bg-light text-dark">
            <div className="mx-auto w-full max-w-6xl p-6">
              <GlobalErrorMessenger />
              {children}
            </div>
          </main>
        </div>
      </div>
    </MobileSidebarContext.Provider>
  );
}

