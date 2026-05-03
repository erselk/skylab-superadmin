'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { UserDto } from '@/types/api';

interface UsersGridClientProps {
  users: UserDto[];
}

export function UsersGridClient({ users }: UsersGridClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || username.includes(query);
    });
  }, [users, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-4 py-2 pl-10 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
          />
          <svg
            className="text-dark-400 absolute top-2.5 left-3 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-dark-400 hover:text-dark-600 absolute top-2.5 right-3"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredUsers.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="border-dark-200 bg-light hover:border-brand hover:bg-brand-50 block rounded-lg border p-3 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-100 text-brand-700 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                    {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-dark-900 truncate text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-dark-500 mt-1 truncate text-xs">{user.email || '-'}</p>
                <p className="text-dark-400 mt-1 truncate text-xs">{user.skyNumber || '-'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="border-dark-200 text-dark-500 rounded-lg border border-dashed p-6 text-center text-sm">
          Arama kriterine uygun kullanıcı bulunamadı.
        </div>
      )}
    </div>
  );
}
