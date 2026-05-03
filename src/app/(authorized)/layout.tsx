import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { GlobalErrorMessenger } from '@/components/common/GlobalErrorMessenger';
import { AuthenticatedChrome } from '@/components/layout/AuthenticatedChrome';
import { AuthProvider } from '@/context/AuthContext';
import { serverFetch } from '@/lib/api/server-client';
import { getTokenFromCookies } from '@/lib/auth/token';
import { enrichUserRolesFromAccessToken } from '@/lib/auth/jwt-payload';
import { filterSidebarNavForUser } from '@/lib/navigation/sidebar-nav';
import type { DataResultUserDto, UserDto } from '@/types/api';
export const dynamic = 'force-dynamic';

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = getTokenFromCookies(cookieStore);
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!token && !refreshToken) {
    redirect('/login');
  }

  let user: UserDto | null = null;

  try {
    const response = await serverFetch<DataResultUserDto>('/api/users/me');
    user = response?.data ?? null;
  } catch {
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  const mergedUser = enrichUserRolesFromAccessToken(user, token);
  const sidebarNav = filterSidebarNavForUser(mergedUser);

  return (
    <AuthProvider initialUser={mergedUser}>
      <AuthenticatedChrome sidebarNav={sidebarNav} sidebarUser={mergedUser}>
        <GlobalErrorMessenger />
        {children}
      </AuthenticatedChrome>
    </AuthProvider>
  );
}
