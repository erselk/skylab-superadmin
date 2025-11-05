import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/server-client';
import { normalizeRoleForBackend } from '@/config/roles';

export async function POST(request: NextRequest) {
  try {
    const { username, role } = await request.json();
    if (!username || !role) {
      return NextResponse.json({ success: false, message: 'Username ve role gerekli' }, { status: 400 });
    }

    // Yetki kontrolü: sadece ADMIN
    const me = await serverFetch<any>('/api/users/me');
    const currentUserRoles: string[] = me?.data?.roles ?? [];
    if (!currentUserRoles.includes('ADMIN')) {
      return NextResponse.json({ success: false, message: 'Yalnızca ADMIN rol kaldırabilir' }, { status: 403 });
    }

    const normalizedRole = normalizeRoleForBackend(role);
    const res = await serverFetch(`/api/users/remove-role/${encodeURIComponent(username)}?role=${encodeURIComponent(normalizedRole)}`, {
      method: 'DELETE',
    });

    return NextResponse.json({ success: true, data: res });
  } catch (error: any) {
    const msg = error?.message || 'Bilinmeyen hata';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}


