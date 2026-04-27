'use server';

import { serverFetch } from '@/lib/api/server-client';
import type { DataResultListUserDto, DataResultUserDto, UpdateUserRequest } from '@/types/api';

export async function getUsers() {
  try {
    const response = await serverFetch<DataResultListUserDto>('/api/users');

    if (!response || !response.data) {
      return [];
    }

    return response.data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    if (errorMessage.includes('not.found') || errorMessage.includes('404')) {
      return [];
    }
    console.error('getUsers error:', error);
    throw new Error(`Kullanıcılar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getUserById(id: string) {
  try {
    const response = await serverFetch<DataResultUserDto>(`/api/users/${id}`);

    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }

    return response.data;
  } catch (error) {
    console.error('getUserById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Kullanıcı yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createUser(formData: FormData) {
  void formData;
  throw new Error('Yeni kullanici olusturma endpointi backend API sozlesmesinde bulunmuyor');
}

export async function updateUser(id: string, formData: FormData) {
  try {
    const data: UpdateUserRequest = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      linkedin: (formData.get('linkedin') as string) || undefined,
      university: (formData.get('university') as string) || undefined,
      faculty: (formData.get('faculty') as string) || undefined,
      department: (formData.get('department') as string) || undefined,
    };

    await serverFetch<DataResultUserDto>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateUser error:', error);
    throw error;
  }
}
