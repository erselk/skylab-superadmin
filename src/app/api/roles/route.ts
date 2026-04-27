import { NextResponse } from 'next/server';
import { ALLOWED_ROLES } from '@/config/roles';
import { isSuperAdmin } from '@/lib/utils/permissions';

// GET endpoint'ini dinamik hale getiriyoruz
export async function GET() {
  try {
    // 1. Statik rolleri al
    const staticRoles = new Set<string>(ALLOWED_ROLES as unknown as string[]);

    // 2. Mevcut kullanıcının yetkilerini kontrol et
    // Mevcut kullanıcının rollerini alıp atanabilir listeyi daraltalım
    let currentUserRoles: string[] = [];
    try {
      const { serverFetch } = await import('@/lib/api/server-client');
      const me = await serverFetch<any>('/api/users/me');
      currentUserRoles = me?.data?.roles ?? [];
    } catch {
      // Yetkisiz ise boş bırak
    }

    // Backend kuralı: Role atama sadece ADMIN tarafından yapılabilir (şimdilik)
    // Eğer ileride logic değişirse burayı güncelleyebiliriz.
    if (!isSuperAdmin({ roles: currentUserRoles } as any)) {
      return NextResponse.json({ roles: [] });
    }

    return NextResponse.json({ roles: Array.from(staticRoles) });
  } catch (e) {
    console.error('Roller servisinde hata:', e);
    // Hata durumunda en azından statik listeyi dön
    return NextResponse.json({ roles: ALLOWED_ROLES }, { status: 200 });
  }
}
