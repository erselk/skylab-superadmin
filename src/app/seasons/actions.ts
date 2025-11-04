'use server';

import { seasonsApi } from '@/lib/api/seasons';

export async function getSeasons(params?: { includeEvents?: boolean }) {
  try {
    const response = await seasonsApi.getAll(params);
    return response.data || [];
  } catch (error) {
    throw new Error('Sezonlar yüklenirken hata oluştu');
  }
}

export async function getSeasonById(id: string) {
  try {
    const response = await seasonsApi.getById(id);
    return response.data;
  } catch (error) {
    throw new Error('Sezon yüklenirken hata oluştu');
  }
}

export async function createSeason(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
  };

  try {
    await seasonsApi.create(data);
  } catch (error) {
    throw error;
  }
}

export async function deleteSeason(id: string) {
  try {
    await seasonsApi.delete(id);
  } catch (error) {
    throw error;
  }
}

