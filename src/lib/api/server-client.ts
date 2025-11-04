import { cookies } from 'next/headers';
import { apiClient } from './client';

export async function getApiClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (token) {
    apiClient.setToken(token);
  }
  
  return apiClient;
}

