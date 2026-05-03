import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTokenFromCookies } from '@/lib/auth/token';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = getTokenFromCookies(cookieStore);
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // Erişim yoksa login. Süresi dolmuş access JWT olsa bile refresh cookie varsa dashboard'a
  // gidip `/api/auth/me` sessiz yenilemesine bırak (OAuth ping-pong döngüsünü keser).
  if (!token && !refreshToken) {
    redirect('/login');
  }

  redirect('/dashboard');
}
