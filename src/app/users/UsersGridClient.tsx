'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { UserDto } from '@/types/api';

interface UsersGridClientProps {
  usersByGroup: Record<string, UserDto[]>;
}

export function UsersGridClient({ usersByGroup }: UsersGridClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const groupLabels: Record<string, string> = {
    ADMIN: 'Admin',
    YONETIM: 'Yönetim',
    AGC: 'AGC',
    GECEKODU: 'GeceKodu',
    BIZBIZE: 'BizBiz\'e',
    USER: 'Kullanıcı',
  };

  const groupOrder = ['ADMIN', 'YONETIM', 'AGC', 'GECEKODU', 'BIZBIZE', 'USER'];

  // Arama fonksiyonu
  const filterUsers = (users: UserDto[]): UserDto[] => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || username.includes(query);
    });
  };

  // Filtrelenmiş gruplar
  const filteredGroups = useMemo(() => {
    const filtered: Record<string, UserDto[]> = {};
    groupOrder.forEach(group => {
      filtered[group] = filterUsers(usersByGroup[group] || []);
    });
    return filtered;
  }, [usersByGroup, searchQuery]);

  // Birleşik grupları hazırla (breakpoint'lere göre kullanacağız)
  const mergedFor4Cols = useMemo(() => ({
    ADMIN: filteredGroups.ADMIN,
    YONETIM: filteredGroups.YONETIM,
    ETKINLIK: [
      ...(filteredGroups.AGC || []),
      ...(filteredGroups.GECEKODU || []),
      ...(filteredGroups.BIZBIZE || []),
    ],
    USER: filteredGroups.USER,
  }), [filteredGroups]);

  const mergedFor3Cols = useMemo(() => ({
    YONETICI: [
      ...(filteredGroups.ADMIN || []),
      ...(filteredGroups.YONETIM || []),
    ],
    ETKINLIK: [
      ...(filteredGroups.AGC || []),
      ...(filteredGroups.GECEKODU || []),
      ...(filteredGroups.BIZBIZE || []),
    ],
    USER: filteredGroups.USER,
  }), [filteredGroups]);

  const mergedFor2Cols = useMemo(() => ({
    YETKILI: [
      ...(filteredGroups.ADMIN || []),
      ...(filteredGroups.YONETIM || []),
      ...(filteredGroups.AGC || []),
      ...(filteredGroups.GECEKODU || []),
      ...(filteredGroups.BIZBIZE || []),
    ],
    USER: filteredGroups.USER,
  }), [filteredGroups]);

  const renderColumn = (title: string, users: UserDto[]) => (
    <div key={title} className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold text-dark-900 mb-1">{title}</h2>
        <div className="border-b border-dark-200"></div>
      </div>
      <div className="space-y-1.5">
        {users.length === 0 ? (
          <p className="text-xs text-dark-400">Kullanıcı yok</p>
        ) : (
          users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="block bg-light border border-dark-200 rounded-md px-2 py-1.5 hover:bg-brand-50 hover:border-brand transition-all cursor-pointer group min-w-0"
            >
              <div className="text-xs font-medium text-dark-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] text-dark-500 mt-0.5 truncate" title={user.email || ''}>
                {user.email}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Arama Kutusu */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50 text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-dark-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-dark-400 hover:text-dark-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 6 sütun (lg ve üstü) */}
      <div className="hidden lg:grid grid-cols-6 gap-4">
        {groupOrder.map((group) => renderColumn(groupLabels[group], filteredGroups[group] || []))}
      </div>

      {/* 4 sütun (md:lg arası) */}
      <div className="hidden md:grid lg:hidden grid-cols-4 gap-4">
        {renderColumn('Admin', mergedFor4Cols.ADMIN || [])}
        {renderColumn('Yönetim', mergedFor4Cols.YONETIM || [])}
        {renderColumn('Etkinlik', mergedFor4Cols.ETKINLIK || [])}
        {renderColumn('Kullanıcı', mergedFor4Cols.USER || [])}
      </div>

      {/* 3 sütun (sm:md arası) */}
      <div className="hidden sm:grid md:hidden grid-cols-3 gap-4">
        {renderColumn('Yönetici', mergedFor3Cols.YONETICI || [])}
        {renderColumn('Etkinlik', mergedFor3Cols.ETKINLIK || [])}
        {renderColumn('Kullanıcı', mergedFor3Cols.USER || [])}
      </div>

      {/* 2 sütun (mobil) */}
      <div className="grid sm:hidden grid-cols-2 gap-4">
        {renderColumn('Yetkili', mergedFor2Cols.YETKILI || [])}
        {renderColumn('Kullanıcı', mergedFor2Cols.USER || [])}
      </div>
    </div>
  );
}

