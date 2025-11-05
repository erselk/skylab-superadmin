import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  // Cookie'yi kontrol et
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  // Token yoksa login'e yönlendir (middleware zaten yapıyor ama ekstra güvenlik için)
  if (!token) {
    redirect('/login');
  }

  // Token varsa ama süresi geçmiş/geçersizse login'e yönlendir
  try {
    const [, payloadBase64] = token.split('.');
    const payloadJson = Buffer.from(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson) as { exp?: number };

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (!payload?.exp || payload.exp <= nowInSeconds) {
      redirect('/login');
    }
  } catch {
    // JWT parse edilemezse güvenli tarafta kal ve login'e yönlendir
    redirect('/login');
  }

  // Geçerli token varsa dashboard'a yönlendir
  redirect('/dashboard');
}
