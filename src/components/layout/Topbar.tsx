'use client';

import { usersApi } from '@/lib/api/users';
import { useEffect, useState } from 'react';
import type { UserDto } from '@/types/api';

export function Topbar() {
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    usersApi.getMe().then((response) => {
      if (response.success && response.data) {
        setUser(response.data);
      }
    }).catch(() => {
      // Handle error
    });
  }, []);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.firstName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
