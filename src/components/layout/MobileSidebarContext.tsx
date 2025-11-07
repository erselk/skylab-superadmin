'use client';

import { createContext, useContext } from 'react';

type MobileSidebarContextValue = {
  open: () => void;
  close: () => void;
};

export const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(null);

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

