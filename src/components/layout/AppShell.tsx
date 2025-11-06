'use client';

import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-light">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-light">
        <main className="flex-1 overflow-y-auto p-6 bg-light text-dark">
          {children}
        </main>
      </div>
    </div>
  );
}

