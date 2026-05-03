import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { DataResult, UserDto } from '@/types/api';
import { enrichUserRolesFromAccessToken } from '@/lib/auth/jwt-payload';
import { getTokenFromCookies } from '@/lib/auth/token';
import { refreshAccessToken } from '@/lib/auth/oauth2';

async function fetchCurrentUser(token: string): Promise<Response> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';
  return fetch(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let token = getTokenFromCookies(cookieStore);

    if (!token) {
      console.log('⚠️ /api/auth/me: Token bulunamadı');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log('✅ /api/auth/me: Token bulundu, uzunluk:', token.length);
    let response = await fetchCurrentUser(token);

    // Access token süresi dolduysa refresh token ile yenile ve bir kez daha dene.
    if (response.status === 401) {
      const refreshToken = cookieStore.get('refresh_token')?.value;
      if (refreshToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken);
          token = refreshed.access_token;

          cookieStore.set('auth_token', refreshed.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });
          cookieStore.set('access_token', refreshed.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });
          cookieStore.set('refresh_token', refreshed.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          });

          response = await fetchCurrentUser(token);
        } catch (refreshError) {
          console.error('❌ /api/auth/me: Token refresh başarısız:', refreshError);
        }
      }
    }

    if (!response.ok) {
      // 502 Bad Gateway - Backend'e erişilemiyor
      if (response.status === 502) {
        console.error(
          '❌ /api/auth/me: Backend 502 Bad Gateway - Backend servisi çalışmıyor olabilir',
        );
        // Backend down olsa bile token geçerli olabilir, bu yüzden authenticated: true döndür ama user bilgisi olmadan
        return NextResponse.json(
          {
            authenticated: true,
            user: null,
            error: 'Backend servisi şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.',
          },
          { status: 200 },
        );
      }

      console.error(
        '❌ /api/auth/me: Backend yanıtı başarısız:',
        response.status,
        response.statusText,
      );
      // Token geçersizse cookie'yi temizle
      cookieStore.delete('auth_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const backendResponse: DataResult<UserDto> = await response.json();

    console.log('✅ /api/auth/me: Backend yanıtı başarılı, user:', backendResponse.data?.username);

    const bare = backendResponse.data;
    if (!bare || typeof bare !== 'object') {
      return NextResponse.json({
        authenticated: true,
        user: bare ?? null,
      });
    }

    /** UserDto sıkça roles taşımaz; Roller JWT içinde ise menü/sync için birleştirilir */
    const user = enrichUserRolesFromAccessToken(bare, token);
    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('❌ /api/auth/me: Hata:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
