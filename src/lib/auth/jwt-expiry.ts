/**
 * Sunucuda access JWT'nin süresinin dolmuş sayılıp sayılmayacağını kontrol eder.
 * Süre alanı yoksa (opaque token vb.) süresiz kabul edilir.
 */
export function isJwtExpired(token: string, leewaySeconds = 15): boolean {
  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return true;
    const payloadJson = Buffer.from(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8');
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (payload.exp == null) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec + leewaySeconds;
  } catch {
    return true;
  }
}
