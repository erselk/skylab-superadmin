'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';

const registerSchema = z.object({
  username: z.string().min(3, 'En az 3 karakter olmalı'),
  email: z.string().email('Geçerli bir email girin'),
  firstName: z.string().min(2, 'En az 2 karakter olmalı'),
  lastName: z.string().min(2, 'En az 2 karakter olmalı'),
  password: z.string().min(6, 'En az 6 karakter olmalı'),
});

export default function NewUserPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      try {
        await authApi.register(data);
        router.push('/users');
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Kullanıcı</h1>
        <Form schema={registerSchema} onSubmit={handleSubmit}>
          {(methods) => (
            <>
              <div className="space-y-4">
                <TextField name="username" label="Kullanıcı Adı" required />
                <TextField name="email" label="Email" type="email" required />
                <TextField name="firstName" label="Ad" required />
                <TextField name="lastName" label="Soyad" required />
                <TextField name="password" label="Şifre" type="password" required />
              </div>
              <div className="mt-6 flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button href="/users" variant="secondary">
                  İptal
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppShell>
  );
}

