'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOAuth2AuthUrl } from '@/lib/auth/oauth2';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    window.location.href = getOAuth2AuthUrl();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Yönlendiriliyor...</h1>
        <p className="text-gray-600">Giriş sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}

