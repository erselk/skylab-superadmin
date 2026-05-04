'use client';

import { ReactNode } from 'react';
import { HiOutlineBars3 } from 'react-icons/hi2';
import { useMobileSidebar } from './MobileSidebarContext';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  const sidebar = useMobileSidebar();

  const baseClasses = 'border-b border-dark-200 pb-6';
  const layoutClasses = actions
    ? 'space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between'
    : 'space-y-1';

  const combinedClassName = [baseClasses, layoutClasses, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      <div className="flex items-start gap-3 sm:items-center">
        {sidebar?.open && sidebar.close ? (
          <button
            type="button"
            onClick={() => (sidebar.isOpen ? sidebar.close() : sidebar.open())}
            aria-expanded={sidebar.isOpen}
            aria-controls="sidebar-mobile-panel"
            className="bg-light text-dark hover:bg-light-100 focus:ring-brand focus:ring-offset-light inline-flex h-10 w-10 cursor-pointer items-center justify-center transition focus:ring-2 focus:ring-offset-2 focus:outline-none lg:hidden"
            aria-label={sidebar.isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            <HiOutlineBars3 className="h-5 w-5" />
          </button>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-brand text-3xl font-bold">{title}</h1>
          {description ? <p className="text-dark-600 text-sm">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
