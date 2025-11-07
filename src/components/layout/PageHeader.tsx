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
        {sidebar?.open ? (
          <button
            type="button"
            onClick={sidebar.open}
            className="inline-flex h-10 w-10 items-center justify-center bg-light text-dark transition hover:bg-light-100 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-light lg:hidden"
            aria-label="Menüyü aç"
          >
            <HiOutlineBars3 className="h-5 w-5" />
          </button>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-brand">{title}</h1>
          {description ? <p className="text-sm text-dark-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

