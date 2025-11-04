const OAUTH2_AUTH_URL = 'https://e.yildizskylab.com/realms/e-skylab/protocol/openid-connect/auth';
const OAUTH2_TOKEN_URL = 'https://e.yildizskylab.com/realms/e-skylab/protocol/openid-connect/token';
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH2_REDIRECT_URI!;

export function getOAuth2AuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    ...(state && { state }),
  });
  
  return `${OAUTH2_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const response = await fetch(OAUTH2_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) throw new Error('Token exchange failed');
  
  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

