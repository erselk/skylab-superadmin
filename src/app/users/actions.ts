'use server';

import { getApiClient } from '@/lib/api/server-client';
import { usersApi } from '@/lib/api/users';

export async function getUsers() {
  await getApiClient(); // Token'ı cookie'den oku ve API client'a set et
  try {
    const response = await usersApi.getAll();
    return response.data || [];
  } catch (error) {
    throw new Error('Kullanıcılar yüklenirken hata oluştu');
  }
}

export async function getUserById(id: string) {
  await getApiClient();
  try {
    const response = await usersApi.getById(id);
    return response.data;
  } catch (error) {
    throw new Error('Kullanıcı yüklenirken hata oluştu');
  }
}

export async function createUser(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };

  try {
    await usersApi.getAll(); // Users API'de create yok, register kullanılmalı
    // Burada authApi.register kullanılmalı
  } catch (error) {
    throw error;
  }
}

export async function updateUser(id: string, formData: FormData) {
  await getApiClient();
  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    linkedin: formData.get('linkedin') as string,
    university: formData.get('university') as string,
    faculty: formData.get('faculty') as string,
    department: formData.get('department') as string,
  };

  try {
    await usersApi.update(id, data);
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(id: string) {
  await getApiClient();
  try {
    await usersApi.delete(id);
  } catch (error) {
    throw error;
  }
}

