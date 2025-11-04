'use server';

import { competitorsApi } from '@/lib/api/competitors';

export async function getCompetitors() {
  try {
    const response = await competitorsApi.getMy();
    return response.data || [];
  } catch (error) {
    throw new Error('Yarışmacılar yüklenirken hata oluştu');
  }
}

export async function createCompetitor(formData: FormData) {
  const data = {
    userId: formData.get('userId') as string,
    eventId: formData.get('eventId') as string,
    points: parseFloat(formData.get('points') as string) || 0,
    winner: formData.get('winner') === 'true',
  };

  try {
    await competitorsApi.create(data);
  } catch (error) {
    throw error;
  }
}

export async function updateCompetitor(id: string, formData: FormData) {
  const data = {
    userId: formData.get('userId') as string,
    eventId: formData.get('eventId') as string,
    points: parseFloat(formData.get('points') as string),
    winner: formData.get('winner') === 'true',
  };

  try {
    await competitorsApi.update(id, data);
  } catch (error) {
    throw error;
  }
}

export async function deleteCompetitor(id: string) {
  try {
    await competitorsApi.delete(id);
  } catch (error) {
    throw error;
  }
}

