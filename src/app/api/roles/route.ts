import { NextResponse } from 'next/server';
import { ALLOWED_ROLES, ASSIGNABLE_ROLES_BY_ROLE } from '@/config/roles';
import { serverFetch } from '@/lib/api/server-client';

export async function GET() {
  try {
    // Mevcut kullanıcının rollerini alıp atanabilir listeyi daraltalım
    let currentUserRoles: string[] = [];
    try {
      const me = await serverFetch<any>('/api/users/me');
      currentUserRoles = me?.data?.roles ?? [];
    } catch {
      // Yetkisiz ise boş bırak
    }

    // Backend kuralı: Role atama sadece ADMIN tarafından yapılabilir
    if (!currentUserRoles.includes('ADMIN')) {
      return NextResponse.json({ roles: [] });
    }

    const assignable = new Set<string>(ALLOWED_ROLES as unknown as string[]);

    return NextResponse.json({ roles: Array.from(assignable) });
  } catch (e) {
    return NextResponse.json({ roles: ALLOWED_ROLES }, { status: 200 });
  }
}


