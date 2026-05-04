/**
 * Oturumu sunucuda sonlandırmaya çalışır; istemci oturum verisini temizler ve
 * giriş sayfasına yönlendirir (ağ hatasında da çıkışı tamamlar).
 */
export async function performClientLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_user');
    window.location.href = '/login';
  }
}
